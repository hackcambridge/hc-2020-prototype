@extends('layouts.home')
@section('title', 'Apply — Hack Cambridge 101')

@section('header-content')
    <div id="intro-container">
        <img id="top-logo-solo" src="{{ asset('images/101-white.png') }}" />
    </div>
@endsection

@section('content')
    <section id="" class="section-diagonal static-section section-pink">
        <div class="container grid-lg" style="padding:2rem 30px 1rem;">
            <h1 class="section-header">Apply for Hack Cambridge</h1>
            @if($open)        
                <a href="{{ route('dashboard_index') }}">
                    <img id="register-button" src="{{ asset('images/101-register.png') }}" />
                </a>
            @else
                <br />
                <h4 class="section-header">Applications are now closed.</h4>
            @endif
            <!-- <p>To start of continue your application, log in with MyMLH.</p> -->
            <p class="legal-text">By authorising Hack Cambridge to view your MyMLH profile you agree to our <a href="{{ route('privacy') }}">Privacy Policy</a> and <a href="{{ route('terms') }}">Terms and Conditions</a>.
        </div>
    </section>
@endsection

