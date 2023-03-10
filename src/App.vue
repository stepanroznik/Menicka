<template>
    <div class="menus-container" :key="apiURL">
        <div class="menu" v-for="restaurant in displayedRestaurants" :key="restaurant.code">
            <hr />
            <h1>
                <a :href="restaurant.url"> {{ restaurant.name }} </a>
            </h1>
            <hr />
            <Suspense>
                <RestaurantMenu :apiURL="apiURL" :code="restaurant.code" />
                <template #fallback>
                    <div
                        class="menu"
                        :style="{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '340px',
                        }"
                    >
                        <LoadingSpinner />
                    </div>
                </template>
            </Suspense>
        </div>
    </div>
    <div class="options">
        <SettingsIcon @click="showSettings = !showSettings" />
        <Transition>
            <SettingsModal
                :items="displayedRestaurants"
                :hiddenItems="hiddenRestaurants"
                v-if="showSettings"
                @reorder="saveRestaurants"
                @change-api="$event => apiURL = $event"
            />
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { IMenuCode } from '../types';
import RestaurantMenu from './components/RestaurantMenu.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
import SettingsIcon from './components/SettingsIcon.vue';
import SettingsModal from './components/SettingsModal.vue';

const showSettings = ref(false);

const availableRestaurants: IMenuCode[] = [
    {
        code: 'ma-hostina',
        name: 'Má Hostina',
        url: 'https://www.mahostina.cz/',
    },
    {
        code: 'klub-cestovatelu',
        name: 'Klub cestovatelů',
        url: 'https://www.klubcestovatelubrno.cz/denni-menu/',
    },
    {
        code: 'borgeska',
        name: 'Borgeska',
        url: 'https://www.menicka.cz/4919-borgeska.html',
    },
    {
        code: 'kralovska-cesta',
        name: 'Královská cesta',
        url: 'https://menu2go.cz/',
    },
    {
        code: 'racek',
        name: 'Racek',
        url: 'https://www.restauraceracek.cz/tydenni-menu/',
    },
];

const displayedRestaurants = ref([] as IMenuCode[]);
const hiddenRestaurants = computed(() => availableRestaurants.filter(
    (a) => !displayedRestaurants.value.map((d) => d.code).includes(a.code),
));
const apiURL = ref(process.env.VUE_APP_URL);

const loadSavedRestaurants = () => {
    let savedItems: IMenuCode[] | undefined;
    try {
        const loadedItems: string[] = JSON.parse(
            localStorage.getItem('saved-restaurants') as string,
        );
        if (loadedItems) {
            savedItems = loadedItems.map((l) => availableRestaurants
                .find((a) => a.code === l)).filter((l) => l) as IMenuCode[];
        }
    } catch (e) {
        console.error(e);
    }
    displayedRestaurants.value = savedItems || availableRestaurants;
};

const saveRestaurants = (items: IMenuCode[]) => {
    displayedRestaurants.value = items;
    try {
        const codes = items.map((i) => i.code);
        localStorage.setItem('saved-restaurants', JSON.stringify(codes));
    } catch (e) {
        console.error(e);
    }
};

loadSavedRestaurants();
</script>

<style>
html,
body {
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

.options {
    display: none;
    gap: 1em;
    flex-direction: row-reverse;
    align-items: flex-end;
    position: fixed;
    bottom: 1em;
    right: 1em;
}

@media only screen and (min-width: 1024px) {
    .options {
        display: flex;
    }
}

.options svg {
    opacity: 60%;
    height: 60px;
    width: 60px;
    transition: all 0.33s;
    cursor: pointer;
}

.options svg:hover {
    opacity: 100%;
}

a,
a:visited,
a:active {
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
        content: "P:";
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

.v-enter-active,
.v-leave-active {
    transition: opacity 0.33s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
