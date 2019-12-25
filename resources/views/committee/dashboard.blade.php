@extends('layouts.base')

@section('title', 'Committee Dashboard')

@section('content')
    <link rel="stylesheet" type="text/css" href="{{ mix('assets/css/app.css') }}">
    <div id="loading" class="lds-ripple"><div></div><div></div></div>
    <div id="committee-root"></div>
    <script src="{{ mix('assets/js/committee.js') }}"></script>
@endsection