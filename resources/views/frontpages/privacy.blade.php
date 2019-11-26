@extends('layouts.home')
@section('title', 'Hack Cambridge 101')

@section('header-content')
    <div id="intro-container">
        <!-- <h1 id="intro-title">Hack Cambridge is back!</h1> -->
        <img id="top-logo-small" src="{{ asset('images/apply-for-101.png') }}" />
    </div>
@endsection

@section('content')
    <section id="" class="section-diagonal static-section">
        <div class="container grid-lg" style="padding:2rem 30px 1rem;height:800px;">
            <h1>HTML Ipsum Presents</h1>
            <p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p>
        </div>
    </section>

    <section id="" class="section-diagonal static-section section-speaker">
        <div class="container grid-lg" style="height: 400px;">
        </div>
    </section>
@endsection

