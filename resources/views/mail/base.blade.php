<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <title>Email from Hack Cambridge</title>
    <meta name="viewport" content="width=device-width">
    <meta name="viewport" content="initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,500&display=swap" rel="stylesheet">
    <style type="text/css">
        .body, .footer, a { color: #000000; }
        body {
            overflow-x: hidden;
        }
        .logo {
            width: 4rem;
            max-width: 100%;
            margin: 2rem auto 0;
            display: block;
            padding: 1rem;
        }
        .body {
            font-family: Montserrat,sans-serif;
            max-width: 100%;
            padding: 0 1.5rem;
        }
        .footer {
            max-width: 100%;
            font-family: Montserrat,sans-serif;
            font-size: 0.8rem;
            padding: 1rem 1.5rem 1.5rem;
        }
        a {
            cursor: pointer;
        }
        a.noline {
            text-decoration: none;
        }
        .greeting {
            font-size: 1.3rem;
            font-weight: 700;
        }
        .button {
            margin: 0 auto;
            text-align: center;
            border: 2px solid black;
            text-decoration: none;
            padding: 0.5rem;
            border-radius: 0.2rem;
        }
    </style>
</head>

<body>
    <div class="header">
    <img src="https://hackcambridge.com/images/logo.svg" class="logo" />
    </div>
    <div class="body">
        @yield('content')
    </div>
    <!-- <div class="footer">Hack Cambridge is UK registered charity #1177223.</div> -->
</body>
</html>
