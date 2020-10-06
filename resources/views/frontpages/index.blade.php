@extends('layouts.home')
@section('title', 'Hex Cambridge — The Official University of Cambridge Hackathon')

@section('header-content')
<div id="intro-container">
    <p id="top-tagline" style="">Hex<br />Cambridge</p>

    <div id="intro-description">
        <p>January 16-17th 2021</p>
        <p class="normal-text description">Cambridge's biggest 24h hackathon is back for it's sixth edition bla bla....</p>
        <br />
        <button class="btn btn-lg btn-primary normal-text">Learn more</button>
    </div>
    <img id="top-logo" src="{{ asset('images/logo.svg') }}" />
    <div id="green-hexagon"></div>
    <div id="blue-hexagon"></div>
    <div id="red-hexagon"></div>
    <div id="orange-hexagon"></div>
    <div id="orange-triangle"></div>
    <div id="blue-triangle"></div>
</div>
@endsection

@section('content')
<section id="" class="section-orange">
    <div class="container" style="padding: 3rem 30px 0.25rem;">
        <div id="stamp-card">
            <div id="stamp-card-content">
                <img style="padding: 0.1rem 0 0.3rem;" src="{{ asset('images/official-hackathon.png') }}" />
                <img src="{{ asset('images/cambridge.png') }}" />
            </div>
        </div>
        <div class="intro-text">
            <h1>Hack Cambridge is back!</h1>
            <p>In January 2021, the University of Cambridge’s annual hackathon will yet again bring together 300 outstanding hackers, programmers, designers and more from universities all over the world. For 24 hours, <strong>virtually</strong> they will build, break and innovate to produce genuinely remarkable projects that push the boundaries of technology.</p>
            <!-- <button onclick="window.location.href = '{{ route('apply') }}';" class="apply-button">Apply for HexCambridge →</button> -->
        </div>
        <div class="prev-logos">
            <div>
                <button class="tooltip tooltip-bottom" data-tooltip="HackCambridge 4D, 2019">
                    <img src="{{ asset('images/4d_logo.png') }}" />
                </button>
                <div id="second-place"></div>
            </div><div>
                <button class="tooltip tooltip-bottom" data-tooltip="HackCambridge 101, 2020">
                    <img src="{{ asset('images/101-white-logo.png') }}" />
                </button>
                <div id="first-place"></div>
            </div><div>
                <button class="tooltip tooltip-bottom" data-tooltip="HackCambridge Ternary, 2018">
                    <img src="{{ asset('images/ternary_logo.png') }}" />
                </button>
                <div id="third-place"></div>
            </div>
        </div>
    </div>
</section>
<div class="orange-gap"></div>

<section id="" class="section-hex">
    <div class="container" style="padding:2rem 30px 1rem">
        <h1 class="section-header">FAQ</h1>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 1 -->
                    <input type="checkbox" id="accordion-1" name="accordion-checkbox-1" hidden>
                    <label class="accordion-header" for="accordion-1">
                        <i class="icon icon-arrow-right mr-1"></i> What is a hackathon?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">A hackathon is an invention marathon. Thoughts become things. Attendees work in teams of up to five people to hack together a prototype to solve a problem; this could be a web app, hardware-hack, or something completely different.</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 2 -->
                    <input type="checkbox" id="accordion-2" name="accordion-checkbox-2" hidden>
                    <label class="accordion-header" for="accordion-2">
                        <i class="icon icon-arrow-right mr-1"></i> Do I need a team?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Nope! You are of course welcome to apply in a pre-formed team but some of our hackers will meet their team when they arrive on the first day. </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 9 -->
                    <input type="checkbox" id="accordion-9" name="accordion-checkbox-2" hidden>
                    <label class="accordion-header" for="accordion-9">
                        <i class="icon icon-arrow-right mr-1"></i> How large are the teams?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner"> No more than 4 people can be in a team; otherwise, it would be unfair. </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 3 -->
                    <input type="checkbox" id="accordion-3" name="accordion-checkbox-3" hidden>
                    <label class="accordion-header" for="accordion-3">
                        <i class="icon icon-arrow-right mr-1"></i> What am I allowed to build?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Web, mobile, hardware, anything! Projects will be judged based on creativity, technical difficulty, polish and usefulness by a panel of industry judges. The IP of your projects will remain with you.</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 4 -->
                    <input type="checkbox" id="accordion-4" name="accordion-checkbox-4" hidden>
                    <label class="accordion-header" for="accordion-4">
                        <i class="icon icon-arrow-right mr-1"></i> Am I allowed to attend?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Anyone who is currently a registered student or has graduated after 18th January 2019 is eligible to attend. Sadly we can't accommodate anyone under the age of 18 this year.</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 5 -->
                    <input type="checkbox" id="accordion-5" name="accordion-checkbox-5" hidden>
                    <label class="accordion-header" for="accordion-5">
                        <i class="icon icon-arrow-right mr-1"></i> Is Hack Cambridge free to attend?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Absolutely! The weekend is free for all accepted hackers. We provide WiFi, meals, swag, and the workspace.</div>
                    </div>
                </div>
            </div>
        </div>
        <div class=" columns">
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 6 -->
                    <input type="checkbox" id="accordion-6" name="accordion-checkbox-6" hidden>
                    <label class="accordion-header" for="accordion-6">
                        <i class="icon icon-arrow-right mr-1"></i> Do you have a code of conduct?
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner"><a href="{{ route('conduct') }}">Yes</a>. TL;DR be pleasant and respectful to everyone at the event.</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-6">
                <div class="accordion">
                    <!-- Question 7 -->
                    <input type="checkbox" id="accordion-8" name="accordion-checkbox-8" hidden>
                    <label class="accordion-header" for="accordion-8">
                        <i class="icon icon-arrow-right mr-1"></i> I have other questions / am a member of the press!
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Send us an email at <a href="mailto:team@hackcambridge.com">team@hackcambridge.com</a>. We'd love to chat!</div>
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
                        <i class="icon icon-arrow-right mr-1"></i> I have other questions / am a member of the press!
                    </label>
                    <div class="accordion-body faq-body">
                        <div class="inner">Send us an email at <a href="mailto:team@hackcambridge.com">team@hackcambridge.com</a>. We'd love to chat!</div>
                    </div>
                </div>
            </div>
        </div> -->
    </div>
</section>

<section id="" class="section-sponsors">
    <div class="footer-info">
        <div class="diagonal-line">
            <svg style='width: 100%; height: 100%;'>
                <line x1="0" y1="100%" x2="100%" y2="0" style="stroke:rgb(0,0,0);stroke-width:1.5" />
            </svg>
        </div>
        <div class="text-space">
            <div class="diagonal-text">
                Got any other questions? Ask us<br>
                at <a href="mailto:team@hackcambridge.com">team@hackcambridge.com</a>.
            </div>
        </div>
    </div>
    <div class="container" style="">
        <h1 class="section-header">Sponsors</h1>

        <!-- Temporary placeholder -->
        <!-- <h4 style="font-family: var(--title-font);text-align: center;">— We will announce all our sponsors for 101 very soon! —</h4> -->

        <p class="advert">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        <!-- <h6 class="sponsor-tier-title">— Cohost —</h6>
        <div id="sponsors-cohost" class="sponsors-container">
            <div class="item">
                <a href="https://www.blackrock.com" target="_blank">
                    <img src="{{ asset('images/sponsors/blackrock.png') }}" />
                </a>
            </div>
            <div style="clear: both;"></div>
        </div> -->

        <!-- Sponsors should go here 
        <div class="slideshow">
            <section class="hexagon-gallery">
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div><div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>

                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div><div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
                <div class="hex"><img src="https://images.unsplash.com/photo-1500622944204-b135684e99fd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1601&q=80" alt="Image" /></div>
            </section>
        </div> -->

        <div class="mint-triangle"></div>
    </div>
</section>

<section id="" class="section-followus">
    <div class="container" style="padding:1rem 30px 1.5rem">
        <h1 class="section-header">Follow Us</h1>
        <p>Sample text</p>
        <div class="columns">
            <div class="col-sm-12 col-md-6 col-lg-4 col-3">
                <a href="https://www.facebook.com/hackcambridge" target="_blank"><i class="fab fa-facebook-square"></i></a>&nbsp;@HexCambridge
            </div>
            <div class="col-sm-12 col-md-6 col-lg-4 col-3">
                <a href="https://twitter.com/hack_cambridge" target="_blank"><i class="fab fa-twitter-square"></i></a>&nbsp;@HexCambridge
            </div>
            <div class="col-sm-12 col-md-6 col-lg-4 col-3">
                <a href="https://www.instagram.com/hack_cambridge" target="_blank"><i class="fab fa-instagram-square"></i></a>&nbsp;@HexCambridge
            </div>
            <div class="col-sm-12 col-md-6 col-lg-4 col-3">
                <a href="https://www.linkedin.com/company/hack-cambridge/" target="_blank"><i class="fab fa-linkedin"></i></a>&nbsp;@HexCambridge
            </div>
        </div>
    </div>
</section>

<section id="" class="section-team">
    <div class="container" style="padding:1rem 30px 1.5rem">
        <h1 class="section-header">Our Team</h1>
        <h2 class="section-subheader">The HackCambridge 2021 Team</h2>
        <div class="hex-people">
            <section class="hexagon-gallery">
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="Ivan" />
                    <div>
                        <h1>Ivan Ivanov</h1>
                        <h2>Head of Development</h2>
                    </div>
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <div class="hex">
                    <img src="{{ asset('images/Ivan.jpg') }}" alt="some" />
                </div>
                <!-- <div class="hex"><img src="{{ asset('images/Ivan.jpg') }}" alt="some"></div> -->
                <!-- <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div>
                <div class="hex"></div> -->
            </section>
        </div>
    </div>
</section>

@endsection
