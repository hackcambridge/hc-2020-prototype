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
        <link rel="shortcut icon" type="image/png" href="/images/favicon.png"/>

        <link href="https://fonts.googleapis.com/css?family=Ovo:400,700|Arvo&display=swap" rel="stylesheet">    </head>
    <body>

        @env('production')
            // Nothing in prod.
        @elseenv('testing')
            <div style="width: 100%;background-color: #3b7b00;text-align: center;padding: 4px;color: wheat;font-weight: 700;font-size: 0.5rem;">STAGING</div>
        @elseenv('development')
            <div style="width: 100%;background-color: #bd0000;text-align: center;padding: 4px;color: wheat;font-weight: 700;font-size: 0.5rem;">DEVELOPMENT</div>
        @endenv

        <div id="background-particles"></div>
            <section id="header-section" class="section-diagonal-bottom">
                <div class="container grid-lg" style="min-height:200px;">  
                    <ul id="top-menu" class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="/">
                                <div id="logo" style="background-image: url({{ asset('images/hc101_icon_white.svg') }});"></div>
                            </a>
                        </li>
                        <li class="breadcrumb-item">
                            <a href="{{ route('apply') }}">Apply</a>
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
                            <a href="/">
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
                    </ul>
                    <p id="copyright">© Hack Cambridge 2019-2020. Hack Cambridge is UK registered charity #1177223.</p>
                </div>
            </section>

            <!-- MLH Banner -->
            <a id="mlh-trust-badge" style="display:block;max-width:100px;min-width:60px;position:fixed;right:50px;top:0;width:10%;z-index:10000" href="https://mlh.io/seasons/eu-2020/events?utm_source=eu-hackathon&utm_medium=TrustBadge&utm_campaign=2020-season&utm_content=white" target="_blank">
                <img src="https://s3.amazonaws.com/logged-assets/trust-badge/2020/mlh-trust-badge-2020-white.svg" alt="Major League Hacking 2020 Hackathon Season" style="width:100%">
            </a>
        <!-- </div> -->

        <!-- <script src="//cdn.jsdelivr.net/npm/vivus@latest/dist/vivus.min.js"></script> -->
        <!-- <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script> -->
        <script>
            // particlesJS.load('background-particles', "{{ asset('assets/js/particlesjs-config.json') }}", function() {
            //     //console.log('callback - particles.js config loaded');
            // });

            var gradients = [
                [[15,32,39], [44,83,100]],
                [[15,12,41], [48,43,99]],
                [[11,11,11], [45,52,54]],
            ];

            const fps = 25;
            const changeCadence = 5; // s
            const refreshCadence = (1000 / fps); // ms
            const gradientSpeed = 1 / (fps * changeCadence);
            const html = document.getElementsByTagName("html")[0];

            var currentGradient = 0; // Math.floor(Math.random() * (gradients.length));;
            var transitionTick = 0;
            function nextGradient() {
                if(transitionTick >= 1) {
                    currentGradient = (currentGradient + 1) % gradients.length;
                    transitionTick = 0;
                }
                
                if(html) {
                    html.style.cssText = "background: linear-gradient(0deg, "+calculateIntermediaryColour(0, 0.7)+", "+calculateIntermediaryColour(1, 0.7)+"), url(/images/hc_backdrop_tessalating_small.png), #000;"
                    transitionTick += gradientSpeed;
                }
            }

            function calculateIntermediaryColour(component, alpha=1) {
                var nextGradient = (currentGradient + 1) % gradients.length;
                var r = (1 - transitionTick) * gradients[currentGradient][component][0] + transitionTick * gradients[nextGradient][component][0];
                var g = (1 - transitionTick) * gradients[currentGradient][component][1] + transitionTick * gradients[nextGradient][component][1];
                var b = (1 - transitionTick) * gradients[currentGradient][component][2] + transitionTick * gradients[nextGradient][component][2];
                // if(component == 0) console.log(`${fmt(r)}  ${fmt(g)}  ${fmt(b)}`);
                return "rgba("+r+","+g+","+b+","+alpha+")";
            }

            function fmt(x) {
                return parseFloat(Math.round(x * 100) / 100).toFixed(2).padStart(5, " ");
            }

            setInterval(nextGradient, refreshCadence);
        </script>
    </body>
</html>