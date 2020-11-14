@extends('layouts.home')
@section('title', 'Apply — Hex Cambridge')

@section('content')
    <section id="" class="section-apply">
        <div class="container grid-lg" style="padding:2rem 30px 1rem;">
            <h1 class="section-header">Apply for Hex Cambridge</h1>
            <!-- @if($open)        
                <a href="{{ route('dashboard_index') }}">
                    <img id="register-button" src="{{ asset('images/logo.svg') }}" />
                </a>
            @else -->
                <br />
                <h4 class="section-header">Applications have not opened yet!</h4>
            <!-- @endif -->
            <!-- <p>To start of continue your application, log in with MyMLH.</p> -->
            <p class="body-text">By authorising Hex Cambridge to view your MyMLH profile you agree to our <a href="{{ route('privacy') }}">Privacy Policy</a> and <a href="{{ route('terms') }}">Terms and Conditions</a>.
        </div>
    </section>
@endsection

