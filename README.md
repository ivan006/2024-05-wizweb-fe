Take the affordable course here:

[https://www.udemy.com/course/web-dev-made-relatively-easy-using-laravel-vue-and-wizweb](https://www.udemy.com/course/web-dev-made-relatively-easy-using-laravel-vue-and-wizweb)

Related libraries:

[https://github.com/ivan006/2024-05-wizweb-be/tree/main](https://github.com/ivan006/2024-05-wizweb-be/tree/main)
[https://github.com/ivan006/2024-05-wizweb-fe/tree/quasar](https://github.com/ivan006/2024-05-wizweb-fe/tree/quasar)

Notes for student:

```
<ifModule mod_rewrite.c>
    RewriteEngine On

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</ifModule>
```
