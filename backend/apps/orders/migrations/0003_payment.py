import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_ordernote'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.PositiveBigIntegerField(verbose_name='مبلغ (ریال)')),
                ('authority', models.CharField(blank=True, max_length=100, verbose_name='کد مرجع درگاه')),
                ('ref_id', models.CharField(blank=True, max_length=100, verbose_name='شماره پیگیری')),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'در انتظار'),
                        ('paid', 'پرداخت شده'),
                        ('failed', 'ناموفق'),
                        ('cancelled', 'لغو شده'),
                    ],
                    default='pending', max_length=20, verbose_name='وضعیت',
                )),
                ('provider', models.CharField(default='mock', max_length=30, verbose_name='درگاه')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='payment', to='orders.order', verbose_name='سفارش',
                )),
            ],
            options={
                'verbose_name': 'پرداخت',
                'verbose_name_plural': 'پرداخت‌ها',
            },
        ),
    ]
