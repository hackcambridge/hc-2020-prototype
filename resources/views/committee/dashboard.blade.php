@extends('layouts.base')

@section('title', 'Committee Dashboard')

@section('content')
    <h1>Committee Dashboard</h1>
    <strong>{{ Auth::user()->type  }}</strong><br>
    <strong>{{ Auth::user()->sub  }}</strong><br>
@endsection
