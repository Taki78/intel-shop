from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import redirect
from django.utils import timezone
from .models import Order, Invoice, Payment
from .serializers import (
    OrderCreateSerializer, OrderListSerializer, OrderDetailSerializer, InvoiceSerializer,
)


class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        return OrderCreateSerializer if self.request.method == 'POST' else OrderListSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items').select_related('invoice')

    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save(user=request.user)
            return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class OrderByNumberView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderDetailSerializer
    lookup_field = 'order_number'

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items').select_related('invoice')


class InvoiceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id, user=request.user)
            return Response(InvoiceSerializer(order.invoice).data)
        except Order.DoesNotExist:
            return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)
        except Invoice.DoesNotExist:
            return Response({'detail': 'فاکتور یافت نشد'}, status=status.HTTP_404_NOT_FOUND)


class PaymentInitiateView(APIView):
    """POST /orders/<pk>/payment/initiate/ — create payment request, return gateway URL."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'سفارش یافت نشد'}, status=status.HTTP_404_NOT_FOUND)

        if order.payment_method != 'online':
            return Response({'detail': 'این سفارش پرداخت آنلاین ندارد'},
                            status=status.HTTP_400_BAD_REQUEST)

        if hasattr(order, 'payment') and order.payment.status == 'paid':
            return Response({'detail': 'این سفارش قبلاً پرداخت شده است'},
                            status=status.HTTP_400_BAD_REQUEST)

        from apps.payments.services import initiate_payment
        from django.conf import settings
        site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
        callback_url = f'{site_url}/api/orders/payment/callback/'

        try:
            result = initiate_payment(order, callback_url)
        except Exception as exc:
            return Response({'detail': f'خطا در اتصال به درگاه پرداخت: {exc}'},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)

        Payment.objects.update_or_create(
            order=order,
            defaults={
                'amount': order.total,
                'authority': result['authority'],
                'status': 'pending',
                'provider': result['provider'],
            },
        )
        return Response({'payment_url': result['payment_url']})


class PaymentCallbackView(APIView):
    """GET /orders/payment/callback/ — ZarinPal/IDPay redirects here after payment.
    Verifies the transaction and redirects the user to the frontend result page."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        authority  = request.GET.get('Authority', '')
        pay_status = request.GET.get('Status', '')

        from django.conf import settings
        site_url = getattr(settings, 'SITE_URL', 'http://localhost:5173')
        frontend_result = f'{site_url}/payment/result/'

        try:
            payment = Payment.objects.select_related('order__user').get(authority=authority)
        except Payment.DoesNotExist:
            return redirect(f'{frontend_result}?status=error&reason=not_found')

        order = payment.order

        if pay_status != 'OK':
            payment.status = 'cancelled'
            payment.save()
            return redirect(f'{frontend_result}?status=cancelled&order={order.order_number}')

        from apps.payments.services import verify_payment
        try:
            result = verify_payment(authority=authority, amount=order.total)
        except Exception:
            payment.status = 'failed'
            payment.save()
            return redirect(f'{frontend_result}?status=failed&order={order.order_number}')

        payment.status = 'paid'
        payment.ref_id = result['ref_id']
        payment.save()

        order.status  = 'processing'
        order.paid_at = timezone.now()
        order.save()

        return redirect(
            f'{frontend_result}?status=ok'
            f'&order={order.order_number}'
            f'&ref={result["ref_id"]}'
        )
