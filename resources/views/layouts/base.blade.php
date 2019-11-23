<html lang="{{ app()->getLocale() }}">
    <head>
        <title>@yield('title') — Hack Cambridge</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="stylesheet" href="{{ asset('assets/css/app.css') }}" />
        <link rel="stylesheet" href="https://unpkg.com/@shopify/polaris@4.0.0-rc.6/styles.min.css" />
        <link rel="shortcut icon" type="image/png" href="{{ asset('images/favicon.png') }}"/>
    </head>
    <body>
        @yield('content')
    </body>
</html>
