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
        Schema::create('sponsor_detail', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('detail_id')->unique();
            $table->string("value")->default("");
            $table->unsignedBigInteger('sponsor_id');
            $table->timestamps();
        });

        Schema::table('sponsor_detail', function($table) {
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
