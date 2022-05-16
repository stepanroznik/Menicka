<template>
    <div class="menus-container">
        <div class="menu" v-for="restaurant in availableRestaurants" :key="restaurant.code">
            <hr>
            <h1> <a :href="restaurant.url"> {{ restaurant.name }} </a> </h1>
            <hr>
            <Suspense>
                <RestaurantMenu :code="restaurant.code" />
                <template #fallback>
                    <div class="menu" :style="{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '360px',
                        }">
                        <LoadingSpinner />
                    </div>
                </template>
            </Suspense>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IMenuCode } from '../types';
import RestaurantMenu from './components/RestaurantMenu.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';

const availableRestaurants: IMenuCode[] = [
    { code: 'ma-hostina', name: 'Má Hostina', url: 'https://menu2go.cz/' },
    { code: 'klub-cestovatelu', name: 'Klub cestovatelů', url: 'https://www.klubcestovatelubrno.cz/denni-menu/' },
    { code: 'borgeska', name: 'Borgeska', url: 'https://www.mahostina.cz/' },
    { code: 'kralovska-cesta', name: 'Královská cesta', url: 'https://www.restauraceracek.cz/tydenni-menu/' },
    { code: 'racek', name: 'Racek', url: 'https://www.menicka.cz/4919-borgeska.html' },
];
</script>

<style>
html, body {
    background-color: black;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    max-width: 4096px;
    margin: auto;
    padding: 0.5em;
}

@media only screen and (min-width: 1024px) {
        .menus-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5em;
    }
}

a, a:visited, a:active {
    color: inherit;
    text-decoration: none;
}
h1 {
    margin: 0.4em 0;
}
.meal {
    display: grid;
    grid-template-columns: 5em 1fr 5em;
    grid-gap: 2em;
    padding: 0.65em 0;
    font-size: large;
    line-height: 1.4em;
}
@media only screen and (max-width: 767px) {
    .meal {
        grid-template-columns: 1em 1fr 3.5em;
        grid-gap: 1em;
        font-size: medium;
    }
    .soup-key {
        visibility: hidden;
    }
    .soup-key:before {
        content: 'P:';
        visibility: visible;
    }
}
.value::first-letter {
    text-transform: capitalize;
}
.value::first-letter {
    text-transform: capitalize;
}
.key {
    font-weight: 600;
    text-align: right;
}
</style>
