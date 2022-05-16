export interface IMenuItem {
    restaurant: string;
    url: string;
    soup: { name: string; price?: number | string };
    meals: { name: string; price: number | string }[];
}

export interface IMenuCode {
    code: string
    name: string
    url: string
}
