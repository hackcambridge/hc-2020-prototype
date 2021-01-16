@extends('layouts.home')
@section('title', 'Apply — Hex Cambridge')

@section('content')
    <section id="" class="section-apply">
        <div class="container grid-lg" style="padding:2rem 30px 1rem;">
            <h1 class="section-header">Apply for Hex Cambridge</h1>
            @if($open)        
                <a href="{{ route('dashboard_index') }}">
                    <img id="register-button" src="{{ asset('images/logo_white.png') }}" />
                </a>
                <p>To start, or continue your application, log in with MyMLH.<br/>
                You can edit all parts of your application by the time applications close!</p> 
                <p class="body-text">By authorising Hex Cambridge to view your MyMLH profile you agree to our <a href="{{ route('privacy') }}">Privacy Policy</a> and <a href="{{ route('terms') }}">Terms and Conditions</a>.
            @else
                <br />
                <h4 class="section-header">We are sorry, we don't accept applications!</h4>
            @endif
        </div>
    </section>
@endsection

