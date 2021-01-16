@extends('layouts.home')
@section('title', 'Hex Cambridge — The Official University of Cambridge Hackathon')

@section('header-content')
<div id="intro-container">
</div>
@endsection

@section('content')
<section id="landing" class="section-landing">
    <div class="container grid-xl">
        <p id="top-tagline">Hex Cambridge</p>

        <div id="intro-description">
            <p>January&nbsp;23-24th 2021</p>
            <p class="normal-text description">Cambridge's biggest <strong>36h</strong> hackathon is back for it's sixth iteration and this year we're going fully virtual! We're very excited to present a brand new experience to all of you at Hex Cambridge 2021.</p>
            <a href="{{ route('dashboard_index') }}"><button class="btn btn-lg btn-primary disabled normal-text"><strong>Applications have closed</strong></button></a> <br>
            <!-- <button class="btn btn-primary normal-text" onclick='window.location.href="#about"'>Learn more</button> -->
        </div>
        <img id="top-logo" src="{{ asset('images/logo.svg') }}" />
        <div id="green-hexagon"></div>
        <div id="blue-hexagon"></div>
        <div id="red-hexagon"></div>
        <div id="orange-hexagon"></div>
        <div id="orange-triangle"></div>
        <div id="blue-triangle"></div>
    </div>
</section>
<section id="about" class="section-orange">
    <div class="container" style="padding: 3rem 30px 0.25rem;">
        <div id="stamp-card">
            <div id="stamp-card-content">
                <img style="padding: 0.1rem 0 0.5rem;" src="{{ asset('images/official-hackathon-white.png') }}" />
                <img src="{{ asset('images/uni_cam_white.png') }}" />
            </div>
        </div>
        <div class="intro-text">
            <h1>Hack Cambridge is back!</h1>
            <p>In January 2021, the University of Cambridge’s annual hackathon will yet again bring together 500 outstanding hackers, programmers, designers and more from universities all over the world. For 36 hours, <strong>virtually</strong> they will build, break and innovate to produce genuinely remarkable projects that push the boundaries of technology.</p>
        </div>
        <div class="prev-logos">
            <div>
                <button class="tooltip tooltip-bottom" data-tooltip="HackCambridge 4D, 2019" aria-label="HackCambrdge 4D link">
                    <a href="https://hackcambridge4d.devpost.com/project-gallery" target="_blank"><img src="{{ asset('images/4d_logo.png') }}" /></a>
                </button>
                <div id="second-place"></div>
            </div><div>
                <button class="tooltip tooltip-bottom" data-tooltip="HackCambridge 101, 2020" aria-label="HackCambridge 101 link">
                    <a href="https://hack-cambridge-101.devpost.com/project-gallery" target="_blank"><img src="{{ asset('images/101-white-logo.png') }}" /></a>
                </button>
                <div id="first-place"></div>
            </div><div>
                <button class="tooltip tooltip-bottom" data-tooltip="HackCambridge Ternary, 2018" aria-label="HackCambridge Ternary link">
                    <a href="https://ternary.devpost.com/project-gallery" target="_blank"><img src="{{ asset('images/ternary_logo.png') }}" /></a>
                </button>
                <div id="third-place"></div>
            </div>
        </div>
    </div>
</section>
<div class="orange-gap"></div>

<section id="faq" class="section-hex">
    <div class="container" style="padding:2rem 30px 1rem">
        <h1 class="section-header">FAQ</h1>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-1" name="accordion-checkbox-1" hidden>
                    <label class="accordion-header" for="accordion-1">
                        <i class="icon icon-arrow-right mr-1"></i> What is a hackathon?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">A hackathon is an invention marathon. Thoughts become things. Attendees work in teams of up to 5 people to hack together a prototype to solve a problem; this could be a web app, hardware-hack, or something completely different.</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-2" name="accordion-checkbox-2" hidden>
                    <label class="accordion-header" for="accordion-2">
                        <i class="icon icon-arrow-right mr-1"></i> How is the hackathon going to take place?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">This year to ensure our hackers' safety and comply with governmental and university policies, the hackathon is going to take place <strong>virtually</strong> on a specific online platform. Hackers will be able to join from any point of the world, including their homes, or university accommodations. If some hackers belong to the same household, or want to work together obeying the rule of 6 people gatherings, they are more than welcome to do so!</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-3" name="accordion-checkbox-3" hidden>
                    <label class="accordion-header" for="accordion-3">
                        <i class="icon icon-arrow-right mr-1"></i> Do I need a team?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Nope! You are of course welcome to apply in a pre-formed team but some of our hackers will meet their team at the start of the event. </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-4" name="accordion-checkbox-4" hidden>
                    <label class="accordion-header" for="accordion-4">
                        <i class="icon icon-arrow-right mr-1"></i> How large are the teams?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner"> No more than 5 people can be in a team; otherwise, it would be unfair. </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-5" name="accordion-checkbox-5" hidden>
                    <label class="accordion-header" for="accordion-5">
                        <i class="icon icon-arrow-right mr-1"></i> Am I allowed to attend?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Anyone who is currently a registered student or has graduated after 23rd January 2020 is eligible to attend. Sadly we can't accommodate anyone under the age of 18 this year.</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-6" name="accordion-checkbox-6" hidden>
                    <label class="accordion-header" for="accordion-6">
                        <i class="icon icon-arrow-right mr-1"></i> Is Hex Cambridge free to attend?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Absolutely! Participation is free for all accepted hackers. We provide interesting workshops, entertaining activties, and some swag during the event.</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-7" name="accordion-checkbox-7" hidden>
                    <label class="accordion-header" for="accordion-7">
                        <i class="icon icon-arrow-right mr-1"></i> What am I allowed to build?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Web, mobile, hardware, anything! Projects will be judged based on creativity, technical difficulty, polish and usefulness by a panel of industry judges. The IP of your projects will remain with you.</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-8" name="accordion-checkbox-8" hidden>
                    <label class="accordion-header" for="accordion-8">
                        <i class="icon icon-arrow-right mr-1"></i> Do I need to have experience coding?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Not at all! People from all levels and background are welcome to register for our event. We will ensure you are paired up with more experienced coders for the best possible experience.</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-9" name="accordion-checkbox-9" hidden>
                    <label class="accordion-header" for="accordion-9">
                        <i class="icon icon-arrow-right mr-1"></i> Do you have a code of conduct?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner"><a href="{{ route('conduct') }}">Yes</a>. TL;DR be pleasant and respectful to everyone at the event.</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Extra question for template -->
        <!-- <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <input type="checkbox" id="accordion-8" name="accordion-checkbox-8" hidden>
                    <label class="accordion-header" for="accordion-8">
                        <i class="icon icon-arrow-right mr-1"></i> Question...
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Answer...</div>
                    </div>
                </div>
            </div>
        </div> -->
    </div>
</section>

<section id="sponsors" class="section-sponsors">
    <div class="footer-info">
        <div class="diagonal-line">
            <svg style='width: 100%; height: 100%;'>
                <line x1="0" y1="100%" x2="100%" y2="0" style="stroke:rgb(0,0,0);stroke-width:1.5" />
            </svg>
        </div>
        <div class="text-space">
            <div class="diagonal-text">
                
                <span class="full-email">Got any other questions? Ask us at <a href="mailto:team@hackcambridge.com">team@hackcambridge.com</a>.</span>
                <span class="short-email">Contact us <a href="mailto:team@hackcambridge.com">here</a>.</span>
            </div>
        </div>
    </div>
    <div class="container" style="">
        <h1 class="section-header">Sponsors</h1>

        <p class="advert">
            Hex Cambridge would not be possible without our incredible sponsors. We are proudly sponsored by:
        </p>

        <div class="sponsors-list">
            <div class="cohost-sponsor sponsor-pane">
                <h1>-- Co-host --</h1>
                <div class="hexagon-gallery">
                    <div class="hex">
                        <a href="https://www.mwam.com/" target="_blank">
                            <img src="{{ asset('images/sponsors/marshallwace.png') }}" alt="Marshall Wace" />
                        </a>
                    </div>
                </div>
            </div>
            <div class="tera-sponsor sponsor-pane">
                <h1>-- Tera --</h1>
                <div class="hexagon-gallery">
                    <div class="hex">
                        <a href="https://www.optiver.com/" target="_blank">
                            <img src="{{ asset('images/sponsors/optiver.png') }}" alt="Optiver" />
                        </a>
                    </div>
                    <div class="hex">
                        <a href="https://www.theodo.co.uk/" target="_blank">
                            <img src="{{ asset('images/sponsors/theodo.png') }}" alt="Theodo" />
                        </a>
                    </div>
                    <div class="hex">
                        <a href="https://www.huawei.com/" target="_blank">
                            <img src="{{ asset('images/sponsors/huawei.png') }}" alt="Huawei" />
                        </a>
                    </div>
                </div>
            </div>
            <div class="giga-sponsor sponsor-pane">
                <h1>-- Giga --</h1>
                <div class="hexagon-gallery">
                    <div class="hex">
                        <a href="https://www.hudsonrivertrading.com/" target="_blank">
                            <img src="{{ asset('images/sponsors/hrt.png') }}" alt="Hudson River Trading" />
                        </a>
                    </div>
                    <div class="hex">
                        <a href="https://www.citadel.com/" target="_blank">
                            <img src="{{ asset('images/sponsors/citadel.png') }}" alt="Citadel" />
                        </a>
                    </div>
                    <div class="hex">
                        <a href="https://www.blackrock.com/uk" target="_blank">
                            <img src="{{ asset('images/sponsors/blackrock.png') }}" alt="BlackRock" />
                        </a>
                    </div>
                </div>

            </div>
            <div class="mega-sponsor sponsor-pane">
                <h1>-- Mega --</h1>
                <div class="hexagon-gallery">
                    <div class="hex">
                        <a href="https://www.janestreet.com/" target="_blank">
                            <img src="{{ asset('images/sponsors/janestreet.png') }}" alt="Jane Street" />
                        </a>
                    </div>
                    <div class="hex">
                        <a href="https://www.gresearch.co.uk" target="_blank">
                            <img src="{{ asset('images/sponsors/gresearch.png') }}" alt="G-Research" />
                        </a>
                    </div>
                </div>

            </div>
            <div class="kilo-sponsor sponsor-pane">
                <h1>-- Kilo --</h1>
                <div class="hexagon-gallery">
                    <div class="hex">
                        <a href="https://datascope.co.uk/" target="_blank">
                            <img src="{{ asset('images/sponsors/datascope.png') }}" alt="Datascope" />
                        </a>
                    </div>
                    <div class="hex">
                        <a href="https://www.wolfram.com/language/" target="_blank">
                            <img src="{{ asset('images/sponsors/wolfram.png') }}" alt="Wolfram Language" />
                        </a>
                    </div>
                </div>

            </div>
            <div class="partner-sponsor sponsor-pane">
                <h1>-- Partners --</h1>
                <div class="hexagon-gallery">
                    <div class="hex">
                        <a href="https://hackathons.org.uk/" target="_blank">
                            <img src="{{ asset('images/sponsors/HackUK.png') }}" alt="Hackathons.UK" />
                        </a>
                    </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mint-triangle"></div>
    </div>
</section>

<section id="" class="section-followus">
    <div class="container" style="padding:1rem 30px 1.5rem">
        <h1 class="section-header">Follow Us</h1>
        <!-- <p>Sample text</p> -->
        <div class="columns">
            <div class="col-md-3 col-xl-6 col-3">
                <a href="https://www.facebook.com/hackcambridge" target="_blank"><i class="fab fa-facebook-square"></i>
                    <span class="text-at">&nbsp;@HexCambridge</span></a>
            </div>
            <div class="col-md-3 col-xl-6 col-3">
                <a href="https://twitter.com/hack_cambridge" target="_blank"><i class="fab fa-twitter-square"></i>
                <span class="text-at">&nbsp;@HexCambridge</span></a>
            </div>
            <div class="col-md-3 col-xl-6 col-3">
                <a href="https://www.instagram.com/hack_cambridge" target="_blank"><i class="fab fa-instagram-square"></i>
                <span class="text-at">&nbsp;@HexCambridge</span></a>
            </div>
            <div class="col-md-3 col-xl-6 col-3">
                <a href="https://www.linkedin.com/company/hack-cambridge/" target="_blank"><i class="fab fa-linkedin"></i>
                <span class="text-at">&nbsp;@HexCambridge</span></a>
            </div>
        </div>
    </div>
</section>

<section id="" class="section-team">
    <div class="container">
        <h1 class="section-header">Our Team</h1>
        <h2 class="section-subheader">The HackCambridge 2021 Team</h2>
        <div class="hex-people">
            <section class="hexagon-gallery">
                <div class="hex">
                    <img src="{{ asset('images/team/Ivan.webp') }}" alt="Ivan" />
                    <div>
                        <h1>Ivan Ivanov</h1>
                        <h2>Head of Development</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Chuen.webp') }}" alt="Chuen" />
                    <div>
                        <h1>Chuen Leik Low</h1>
                        <h2>General Manager</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Rohit.webp') }}" alt="Rohit" />
                    <div>
                        <h1>Rohit Kale</h1>
                        <h2>Head of Finance</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Valerie.webp') }}" alt="Valerie" />
                    <div>
                        <h1>Valerie Chuang</h1>
                        <h2>Head of Sponsorship</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Alba.webp') }}" alt="Alba" />
                    <div>
                        <h1>Alba Navarro Rosales</h1>
                        <h2>Head of Design</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Zoey.webp') }}" alt="Zoey" />
                    <div>
                        <h1>Zoey Tan</h1>
                        <h2>Head of Social Relation and Publicity</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Peter.webp') }}" alt="Peter" />
                    <div>
                        <h1>Peter Ondus</h1>
                        <h2>Head of Logistics</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Soham.webp') }}" alt="Soham" />
                    <div>
                        <h1>Soham Mandal</h1>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Charles.webp') }}" alt="Charles" />
                    <div>
                        <h1>Charles Chen</h1>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/team/Karthik.webp') }}" alt="Karthik" />
                    <div>
                        <h1>Karthik Neelamegam</h1>
                    </div>
                </div>
            </section>
        </div>
    </div>
</section>

@endsection
