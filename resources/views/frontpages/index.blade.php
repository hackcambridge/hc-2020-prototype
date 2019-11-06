@extends('layouts.home')
@section('title', 'Hack Cambridge')

@section('header-content')
    <div id="intro-container">
        <h1 id="intro-title">Hack Cambridge is back!</h1>
        <div id="intro-description">
            <p>17<span class="superscript">th</span>-19<span class="superscript">th</span> January, 2020</p>
            <p>Cambridge Corn Exchange, Cambridge CB2 3QB</p>
        </div>
    </div>
    <div id="header-bottom-card">
        <div id="header-bottom-card-content">
            <!-- <p>OFFICIAL HACKATHON</p> -->
            <img style="padding: 0.1rem 0 0.3rem;" src="{{ asset('images/official-hackathon.png') }}" />
            <img src="{{ asset('images/cambridge.png') }}" />
        </div>
    </div>
@endsection

@section('content')
    <section id="" class="section-diagonal static-section">
        <div class="container grid-lg" style="padding:2rem 30px 1rem">
            <h1>HTML Ipsum Presents</h1>
            <p><strong>Pellentesque habitant morbi tristique</strong> 
            senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. 
            <em>Aenean ultricies mi vitae est.</em> 
            Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, 
            <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. 
            <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p>
        </div>
    </section>

    <section id="" class="section-diagonal static-section section-cam-bg">
        <div class="container grid-lg" style="height: 400px;">
        </div>
    </section>
@endsection

