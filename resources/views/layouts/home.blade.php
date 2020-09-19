<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">

<head>
    <title>@yield('title')</title>
    <meta name="viewport" content="width=device-width">
    <meta name="viewport" content="initial-scale=1.0">
    <!-- TODO: Update description -->
    <meta name="description" content="Hex Cambridge is back for its sixth year!">
    <meta property="og:title" content="@yield('title')">
    <!-- TODO: Update description -->
    <meta property="og:description" content="Hex Cambridge is back for its sixth year!">
    <meta property="og:image" content="{{ url('images/meta-image.jpg') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre.min.css">
    <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-exp.min.css">
    <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.14.0/css/all.css" integrity="sha384-HzLeBuhoNPvSl5KYnjx0BT+WB0QEEqLprO+NBkkk5gbc67FTaL7XIGa2w1L0Xbgc" crossorigin="anonymous">
    <link rel="stylesheet" href="{{ mix('assets/css/home.css') }}" />
    <link rel="shortcut icon" type="image/png" href="/images/favicon.png" />
</head>

<body>

    @env('production')
    <!-- Running in production mode. -->
    @elseenv('staging')
    <div class="env-banner" style="background-color: #3b7b00;">STAGING</div>
    @elseenv('development')
    <div class="env-banner" style="background-color: #bd0000;">DEVELOPMENT</div>
    @endenv

    <div id="background-particles"></div>
    <section id="header-section" class="section-diagonal-bottom">
        <div class="container grid-xl" style="min-height:200px;">
            <header id="top-menu" class="navbar">
                <section classs="navbar-section">
                    <a href="/">
                        <div id="logo" style="background-image: url({{ asset('images/logo.svg') }});"></div>
                    </a>
                    <a href="/" class="navbar-brand mr-2">
                        Hex Cambridge
                    </a>
                </section>
                <section class="navbar-section">
                    <a class="options" href="#about">About</a>
                    <a class="options" href="#faq">FAQs</a>
                    <a class="options" href="#sponsors">Sponsors</a>
                </section>
                <!-- <li class="breadcrumb-item">
                    <a href="{{ route('apply') }}">Apply</a>
                </li>
                <li class="breadcrumb-item">
                    @if (Auth::check())
                    <a href="{{ route('dashboard_index') }}">Dashboard</a>
                    @else
                    <a href="{{ route('dashboard_index') }}">Login</a>
                    @endif
                </li> -->
            </header>

            @yield('header-content')
        </div>
    </section>

    @yield('content')

    <section id="footer-section" class="section-diagonal-top">
        <div class="container">
            <div class="columns col-gapless">
                <div class="column col-4 footer-element" id="footer-copyright">
                    HackCambridge&nbsp;©&nbsp;2020
                </div>
                <div class="column col-4 footer-element" id="footer-email">
                    <a href="mailto:team@hackcambridge.com">team@hackcambridge.com</a>
                </div>
                <div class="column col-4 footer-element" id="footer-thumbnails">
                    <a href="https://www.facebook.com/hackcambridge" target="_blank"><i class="fab fa-facebook-square"></i></a>
                    <a href="https://twitter.com/hack_cambridge" target="_blank"><i class="fab fa-twitter-square"></i></a>
                    <a href="https://www.instagram.com/hack_cambridge" target="_blank"><i class="fab fa-instagram-square"></i></a>
                    <a href="" target="_blank"><i class="fab fa-linkedin"></i></a>
                </div>
            </div>
            <!-- <ul id="top-menu" class="breadcrumb" style="text-align: right;">
                <li class="breadcrumb-item">
                    <a href="{{ route('committee_dashboard') }}">
                        <div id="logo" style="background-image: url({{ asset('images/hc101_icon_white.svg') }});"></div>
                    </a>
                </li>
                <li class="breadcrumb-item">
                    <a href="{{route('sponsors_dashboard')}}">Sponsors Portal</a>
                </li>
                <li class="breadcrumb-item">
                    <a href="{{route('conduct')}}">Code of Conduct</a>
                </li>
                <li class="breadcrumb-item">
                    <a href="{{route('privacy')}}">Privacy Policy</a>
                </li>
                <li class="breadcrumb-item">
                    <a href="{{route('terms')}}">Terms & Conditions</a>
                </li>
            </ul> -->
            <!-- <p id="copyright">© Hack Cambridge 2016-2021. Hack Cambridge is UK registered charity #1177223.</p> -->
        </div>
    </section>

    <!-- MLH Banner -->
    <!-- TODO: Get 2021 MLH Banner -->
    <a id="mlh-trust-badge" style="display:block;max-width:80px;min-width:60px;position:fixed;right:30px;top:0;width:10%;z-index:10000" href="https://mlh.io/seasons/eu-2020/events?utm_source=eu-hackathon&utm_medium=TrustBadge&utm_campaign=2020-season&utm_content=white" target="_blank">
        <img src="https://s3.amazonaws.com/logged-assets/trust-badge/2020/mlh-trust-badge-2020-white.svg" alt="Major League Hacking 2020 Hackathon Season" style="width:100%">
    </a>

    <script>
        // particlesJS.load('background-particles', "{{ asset('assets/js/particlesjs-config.json') }}", function() {
        //     //console.log('callback - particles.js config loaded');
        // });

        var gradients = [
            [
                [15, 32, 39],
                [44, 83, 100]
            ],
            [
                [15, 12, 41],
                [48, 43, 99]
            ],
            [
                [11, 11, 11],
                [45, 52, 54]
            ],
        ];

        const fps = 25;
        const changeCadence = 5; // s
        const refreshCadence = (1000 / fps); // ms
        const gradientSpeed = 1 / (fps * changeCadence);
        const html = document.getElementsByTagName("html")[0];

        var currentGradient = 0; // Math.floor(Math.random() * (gradients.length));;
        var transitionTick = 0;

        function nextGradient() {
            if (transitionTick >= 1) {
                currentGradient = (currentGradient + 1) % gradients.length;
                transitionTick = 0;
            }

            if (html) {
                // html.style.cssText = "background: linear-gradient(0deg, " + calculateIntermediaryColour(0, 0.7) + ", " + calculateIntermediaryColour(1, 0.7) + "), url(/images/hc_backdrop_tessalating_small.png) center top, #000;"
                transitionTick += gradientSpeed;
            }
        }

        function calculateIntermediaryColour(component, alpha = 1) {
            var nextGradient = (currentGradient + 1) % gradients.length;
            var r = (1 - transitionTick) * gradients[currentGradient][component][0] + transitionTick * gradients[nextGradient][component][0];
            var g = (1 - transitionTick) * gradients[currentGradient][component][1] + transitionTick * gradients[nextGradient][component][1];
            var b = (1 - transitionTick) * gradients[currentGradient][component][2] + transitionTick * gradients[nextGradient][component][2];
            // if(component == 0) console.log(`${fmt(r)}  ${fmt(g)}  ${fmt(b)}`);
            return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
        }

        function fmt(x) {
            return parseFloat(Math.round(x * 100) / 100).toFixed(2).padStart(5, " ");
        }

        setInterval(nextGradient, refreshCadence);
    </script>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-153422761-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());

        gtag('config', 'UA-153422761-1');
    </script>
</body>

</html>
