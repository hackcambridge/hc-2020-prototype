<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
<title>Title of the document</title>
<meta name="viewport" content="width=device-width">
<meta name="viewport" content="initial-scale=1.0">
<link href="https://fonts.googleapis.com/css?family=Montserrat:300,500&display=swap" rel="stylesheet">
<style type="text/css">
    .st0{
        fill:none;
        stroke:#000000;
        stroke-width:12.4562;
        stroke-linecap:square;
        stroke-linejoin:round;
        stroke-miterlimit:11.3386;
    }
    .logo-middle{ stroke:#000000; }
    .logo-bars{ fill:#000000; }
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

        <svg class="logo" version="1.1"
            id="svg869" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:svg="http://www.w3.org/2000/svg"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 200 140"
            xml:space="preserve">

       <g id="layer1" transform="translate(-120,-320)" >
           <path class="logo-bars" d="M122,382l0,60.2l14-8.1l0-60.2
L122,382z M299,340.8l0,60l14-8.1v-60L299,340.8z"/>
           
            <path class="st0 logo-middle" d="
               M171.5,415.1c-2.7-4.7-2.7-49.3,0-53.9c2.7-4.7,41.3-27,46.7-27s44,22.3,46.7,27c2.7,4.7,2.7,49.3,0,53.9c-2.7,4.7-41.3,27-46.7,27
               C212.8,442.1,174.2,419.8,171.5,415.1z"/>
       </g>
       </svg>
       

    </div>
    <div class="body">
        @yield('content')
    </div>
    <div class="footer">You are receiving this email from Hack Cambridge because you signed up for Hack Cambridge 101. This is being sent in accordance with our <a href="https://hackcambridge.com/privacy">Privacy Policy</a>. <br/><br/>Hack Cambridge is UK registered charity #1177223.</div>
</body>

</html>