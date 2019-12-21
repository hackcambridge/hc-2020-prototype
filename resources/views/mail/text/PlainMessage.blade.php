Hi %recipient.name%!
{!! nl2br(e("\n\n")) !!}
@foreach ($content as $line)
    {{ $line }}
    {!! nl2br(e("\n\n")) !!}
@endforeach

{{ isset($signoff) ? $signoff : "All the best" }},
{!! nl2br(e("\n")) !!}
The Hack Cambridge Team