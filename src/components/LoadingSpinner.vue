<template>
    <div class="lds-dual-ring" />
</template>

<style>
.lds-dual-ring {
    display: inline-block;
    width: 160px;
    height: 160px;
}
.lds-dual-ring:after {
    content: " ";
    display: block;
    width: 128px;
    height: 128px;
    margin: 16px;
    border-radius: 50%;
    border: 8px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
