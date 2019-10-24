<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <title>@yield('title')</title>
        <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre.min.css">
        <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-exp.min.css">
        <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-icons.min.css">
        <link rel="stylesheet" href="{{ asset('assets/css/home.css') }}" />
    </head>
    <body>
        <div id="background-particles"></div>
        <section id="header-section" class="section-diagonal">
            <div class="container grid-lg" style="height:500px;">          
                <!-- <header class="navbar">
                    <section class="navbar-section">
                        <a href="..." class="navbar-brand mr-2">Hack Cambridge</a>
                        <a href="..." class="btn btn-link">Docs</a>
                        <a href="..." class="btn btn-link">GitHub</a>
                    </section>
                </header> -->

                <div id="header-bottom-card">
                    <div id="header-bottom-card-content">
                        <p>OFFICIAL HACKATHON</p>
                        <img src="{{ asset('images/cambridge.png') }}" />
                    </div>
                </div>
            </div>
        </section>
        
        <section id="" class="section-diagonal static-section">
            <div class="container">

            </div>
        </section>

        <section id="footer-section" class="section-diagonal-top" >
            <!-- <div id="footer-particles"></div> -->
            <div class="container grid-lg">
                <!-- <p style="text-align:right;color: white;">Designed and built with <span class="text-error">♥</span> by <a href="https://twitter.com/harribellthomas" target="_blank">Harri</a>.</p> -->
            </div>
        </section>

        <!-- MLH Banner -->
        <a id="mlh-trust-badge" style="display:block;max-width:100px;min-width:60px;position:fixed;right:50px;top:0;width:10%;z-index:10000" href="https://mlh.io/seasons/eu-2020/events?utm_source=eu-hackathon&utm_medium=TrustBadge&utm_campaign=2020-season&utm_content=white" target="_blank">
            <img src="https://s3.amazonaws.com/logged-assets/trust-badge/2020/mlh-trust-badge-2020-white.svg" alt="Major League Hacking 2020 Hackathon Season" style="width:100%">
        </a>

        <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js"></script>
        <script>
            particlesJS.load('background-particles', "{{ asset('assets/js/particlesjs-config.json') }}", function() {
                console.log('callback - particles.js config loaded');
            });
        
            // particlesJS.load('footer-particles', "{{ asset('assets/js/particlesjs-config.json') }}", function() {
            //     console.log('callback - particles.js config loaded');
            // });
        </script>
    </body>
</html>