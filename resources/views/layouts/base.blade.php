<html lang="{{ app()->getLocale() }}">
    <head>
        <title>App Name - @yield('title')</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="{{ asset('assets/css/app.css') }}" />
        <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@4.0.0-rc.6/styles.min.css" />
    </head>
    <body>
        @yield('content')
    </body>
</html>
