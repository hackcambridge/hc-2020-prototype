<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSponsorDetailTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sponsor_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string("type");
            $table->longText("payload");
            $table->string("complete")->default("unknown");
            $table->unsignedBigInteger('sponsor_id');
            $table->timestamps();
        });

        Schema::table('sponsor_details', function($table) {
            $table->foreign('sponsor_id')->references('id')->on('sponsors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sponsor_detail');
    }
}
