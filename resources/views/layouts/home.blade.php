<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <title>@yield('title')</title>
        <meta name="viewport" content="width=device-width">
        <meta name="viewport" content="initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre.min.css">
        <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-exp.min.css">
        <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-icons.min.css">
        <link rel="stylesheet" href="{{ asset('assets/css/home.css') }}" />

        <link href="https://fonts.googleapis.com/css?family=Libre+Baskerville:400,700|Overpass&display=swap" rel="stylesheet">    </head>
    <body>
        <div id="background-particles"></div>
            <section id="header-section" class="section-diagonal-bottom">
                <div class="container grid-lg" style="min-height:200px;">  
                    <ul id="top-menu" class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="#">
                                <div id="logo" style="background-image: url({{ asset('images/hc101_icon_white.svg') }});"></div>
                            </a>
                        </li>
                        <li class="breadcrumb-item">
                            <a href="#">Apply</a>
                        </li>
                        <li class="breadcrumb-item">
                            @if (Auth::check())
                                <a href="{{ route('dashboard_index') }}">Dashboard</a>
                            @else
                                <a href="{{ route('dashboard_index') }}">Login</a>
                            @endif
                        </li>
                    </ul>

                    @yield('header-content')
                </div>
            </section>
            
            @yield('content')

            <section id="footer-section" class="section-diagonal-top" >
                <div class="container grid-lg">
                    <ul id="top-menu" class="breadcrumb" style="text-align: right;">
                        <li class="breadcrumb-item">
                            <a href="#">
                                <div id="logo" style="background-image: url({{ asset('images/hc101_icon_white.svg') }});"></div>
                            </a>
                        </li>
                        <li class="breadcrumb-item">
                            <a href="{{route('sponsors_dashboard')}}">Sponsors Portal</a>
                        </li>
                        <li class="breadcrumb-item">
                            <a href="{{route('dashboard_index')}}">Committee Portal</a>
                        </li>
                    </ul>
                    <!-- <p style="text-align:right;color: white;">Designed and built with <span class="text-error">♥</span> by Harri.</p> -->
                </div>
            </section>

            <!-- MLH Banner -->
            <a id="mlh-trust-badge" style="display:block;max-width:100px;min-width:60px;position:fixed;right:50px;top:0;width:10%;z-index:10000" href="https://mlh.io/seasons/eu-2020/events?utm_source=eu-hackathon&utm_medium=TrustBadge&utm_campaign=2020-season&utm_content=white" target="_blank">
                <img src="https://s3.amazonaws.com/logged-assets/trust-badge/2020/mlh-trust-badge-2020-white.svg" alt="Major League Hacking 2020 Hackathon Season" style="width:100%">
            </a>
        <!-- </div> -->

        <!-- <script src="//cdn.jsdelivr.net/npm/vivus@latest/dist/vivus.min.js"></script> -->
        <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
        <script>
            particlesJS.load('background-particles', "{{ asset('assets/js/particlesjs-config.json') }}", function() {
                console.log('callback - particles.js config loaded');
            });

            // new Vivus('header-logo', {
            //     type: 'delayed',
            //     duration: 200,
            //     animTimingFunction: Vivus.EASE
            // }, null);
        
            // particlesJS.load('footer-particles', "{{ asset('assets/js/particlesjs-config.json') }}", function() {
            //     console.log('callback - particles.js config loaded');
            // });
        </script>
    </body>
</html>