@extends('layouts.home')
@section('title', 'Apply — Hack Cambridge 101')

@section('header-content')
    <div id="intro-container">
        <img id="top-logo-solo" src="{{ asset('images/101-white.png') }}" />
    </div>
@endsection

@section('content')
    <section id="" class="section-diagonal static-section section-pink">
        <div class="container grid-lg" style="padding:2rem 30px 1rem;height:400px;">
            <h1 class="section-header">Apply for Hack Cambridge</h1>
            <p>To start of continue your application, log in with MyMLH.</p>
            <p>By authorising Hack Cambridge to view your MyMLH profile you agree to our <a href="{{ route('privacy') }}">Privacy Policy</a> and Terms and Conditions.
        </div>
    </section>
@endsection

