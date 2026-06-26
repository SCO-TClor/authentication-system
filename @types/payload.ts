type insertInterface = {
    title: string,
    price: number,
    image_src?: string,
    description?: string,
    seo?: string,
    status?: string
};

interface productInterface {
    id: number,
    title?: string,
    price?: number,
    image_src?: string,
    description?: string,
    seo?: string
    status?: string
};

export { insertInterface, productInterface }