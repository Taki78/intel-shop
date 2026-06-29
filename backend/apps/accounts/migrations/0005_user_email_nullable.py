from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_otpcode_delete_passwordresetotp_and_more'),
    ]

    operations = [
        # 1. Make email nullable/blank
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, null=True, unique=True, verbose_name='ایمیل'),
        ),
        # 2. Clear auto-generated placeholder emails
        migrations.RunSQL(
            sql="UPDATE accounts_user SET email = NULL WHERE email LIKE '%@intel-shop.local'",
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
