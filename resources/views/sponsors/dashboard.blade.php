@extends('layouts.base')

@section('title', 'Sponsors')

@section('content')
    <!-- <link rel="stylesheet" type="text/css" href="{{ asset('assets/css/app.css') }}"> -->
    <div id="loading" class="lds-ripple"><div></div><div></div></div>
    <div id="sponsors-root"></div>
    <script src="{{ asset('assets/js/sponsors.js') }}"></script>
@endsection
