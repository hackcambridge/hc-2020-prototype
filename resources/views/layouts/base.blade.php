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
        @env('production')
            // Nothing in prod.
        @elseenv('testing')
            <div style="width: 100%;background-color: #3b7b00;text-align: center;padding: 4px;color: wheat;font-weight: 700;font-size: 0.9rem;bottom: 0;position: absolute;z-index: 100;">STAGING</div>
        @elseenv('development')
            <div style="width: 100%;background-color: #bd0000;text-align: center;padding: 4px;color: wheat;font-weight: 700;font-size: 0.9rem;bottom: 0;position: absolute;z-index: 100;">DEVELOPMENT</div>
        @endenv

        @yield('content')
    </body>
</html>
