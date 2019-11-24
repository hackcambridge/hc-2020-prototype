<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Sponsor extends JsonResource
{

    public function with($request)
    {
        return [
            'success' => true,
        ];
    }

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tier' => $this->tier,
            'privileges' => $this->privileges,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
