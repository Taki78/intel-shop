from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import DiscountCode


class ValidateDiscountView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        if not code:
            return Response({'valid': False, 'message': 'کد تخفیف را وارد کنید'})

        try:
            discount = DiscountCode.objects.get(code=code)
        except DiscountCode.DoesNotExist:
            return Response({'valid': False, 'message': 'کد تخفیف معتبر نیست'})

        valid, message = discount.validate()
        if not valid:
            return Response({'valid': False, 'message': message})

        if discount.discount_type == 'percent':
            label = f'{discount.percent}٪ تخفیف اعمال شد'
        else:
            label = f'{discount.amount:,} تومان تخفیف اعمال شد'

        return Response({
            'valid': True,
            'code': discount.code,
            'discount_type': discount.discount_type,
            'percent': discount.percent,
            'amount': discount.amount,
            'min_order': discount.min_order,
            'message': label,
        })
