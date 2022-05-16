<template>
    <div class="settings-container">
        <div>
            <span class="draggable-info">
                Zobrazené:
            </span>
            <draggable v-model="itemsModel" class="draggable-container">
                <template v-slot:item="{ item }">
                    <div class="draggable-item">
                        {{ item.name }}
                    </div>
                </template>
            </draggable>
        </div>
        <div>
            <span class="draggable-info">
                Skryté:
            </span>
            <draggable :model-value="hiddenItems" class="draggable-container">
                <template v-slot:item="{ item }">
                    <div class="draggable-item">
                        {{ item.name }}
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import Draggable from 'vue3-draggable';
import type { IMenuCode } from '../../types';

const props = defineProps({
    items: {
        type: Array as PropType<IMenuCode[]>,
        required: true,
    },
    hiddenItems: {
        type: Array as PropType<IMenuCode[]>,
        default: () => [],
    },
});

const emit = defineEmits(['reorder']);

const itemsModel = computed({
    get() {
        return props.items;
    },
    set(items: IMenuCode[]) {
        emit('reorder', items);
    },
});
</script>

<style scoped>
.settings-container{
    display: grid;
    min-height: 360px;
    grid-template-columns: 1fr 1fr;
    gap: 1em;
    padding: 1.5em;
    background: #444;
    border-radius: 0.33em;
}
.draggable-info {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5em;
}
.draggable-container {
    display: grid;
    gap: 0.5em;
    grid-auto-columns: 1fr;
    padding: 0.5em;
    background: #666;
    border-radius: 0.33em;
}
.draggable-container:empty {
    padding: 2em;
}
.draggable-item {
    padding: 1em;
    background: #222;
    border-radius: 0.33em;
}
</style>
