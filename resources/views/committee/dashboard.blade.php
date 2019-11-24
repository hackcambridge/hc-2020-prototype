@extends('layouts.base')

@section('title', 'Committee Dashboard')

@section('content')
    <div id="loading" class="lds-ripple"><div></div><div></div></div>
    <div id="committee-root" data-props='@json($props)'></div>
    <script src="{{ asset('assets/js/committee.js') }}"></script>
@endsection

<!--
data-base-url="{{ route('committee_dashboard', array(), false) }}"
        data-user-type="{{ Auth::user()->type }}"
        data-user-name="{{ Auth::user()->name }}" -->
