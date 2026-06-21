from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('admin_api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='shopsettings',
            name='enamad_html',
            field=models.TextField(
                blank=True,
                help_text='کد HTML که از سایت enamad.ir دریافت می‌کنید را اینجا paste کنید',
                verbose_name='کد نماد اعتماد الکترونیکی (اینماد)',
            ),
        ),
    ]
