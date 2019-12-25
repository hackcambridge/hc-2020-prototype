@extends('layouts.base')

@section('title', 'Dashboard')

@section('content')
    <link rel="stylesheet" type="text/css" href="{{ mix('assets/css/app.css') }}">
    <div id="loading" class="lds-ripple"><div></div><div></div></div>
    <div id="dashboard-root"></div>
    <script src="{{ mix('assets/js/dashboard.js') }}"></script>
@endsection
