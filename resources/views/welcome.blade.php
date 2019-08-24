<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Hack Cambridge</title>

        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">

        <!-- Styles -->
        <style>
            html, body {
                background-color: #fff;
                color: #636b6f;
                font-family: 'Nunito', sans-serif;
                font-weight: 200;
                height: 100vh;
                margin: 0;
            }

            .top-right {
                position: absolute;
                right: 10px;
                top: 18px;
            }

            .links > a {
                color: #636b6f;
                padding: 0 25px;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: .1rem;
                text-decoration: none;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>

    @if (Route::has('login'))
        <div class="top-right links">
            @auth
                <span>Hi <strong>{{ Auth::user()->name  }}</strong></span><a href="{{ route('logout') }}">Logout</a>
            @else
                <a href="{{ route('login', "mymlh") }}">MyMLH</a><br>
                <a href="{{ route('login', "email") }}">Passwordless</a>
            @endauth
        </div>
    @endif

    </body>
</html>
