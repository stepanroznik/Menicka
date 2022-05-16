export interface IMenuItem {
    restaurant: string;
    url: string;
    soup: { name: string; price?: number | string };
    meals: { name: string; price: number | string }[];
}
