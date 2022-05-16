<template>
    <div class="menu" v-if="menu">
        <hr>
        <h1> <a href="<%=menu.url%>"> {{ menu.restaurant }} </a> </h1>
        <hr>
            <div v-if="menu.soup?.name" class="meal soup">
                <span class="soup-key key">Polévka: </span>
                <span class="soup-value value">{{ menu.soup.name }}</span>
                    <span v-if="menu.soup.price" class="price soup-price">
                        {{ menu.soup.price }} Kč
                    </span>
            </div>
            <div v-for="meal, index in menu.meals" :key="meal.name" class="meal">
                <!--:class="'meal-' + 1"-->
                <span class="meal-key key"> {{ index + 1 }} : </span>
                <span class="meal-value value"> {{ meal.name }} </span>
                <span class="price"> {{ meal.price }} Kč </span>
            </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import type { IMenuItem } from '../../types';

const props = defineProps({
    code: {
        type: String,
        required: true,
    },
});

const apiURL: string = process.env.VUE_APP_URL;

const menu = ref(null as IMenuItem | null);
const isLoading = ref(true);

const getMenu = async () => {
    isLoading.value = true;
    const response = await axios.get(`${apiURL}/${props.code}`);
    menu.value = response.data;
    isLoading.value = false;
};

await getMenu();
</script>
