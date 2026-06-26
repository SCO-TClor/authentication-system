export class age {
    public readonly value: number;

    constructor(age: number) {
        const max = 100;
        const min = 16
        if(typeof age !== 'number') throw new TypeError('Deve ser número');
        if(!Number.isFinite(age)) throw new TypeError('Idade inválida!');
        if (age < min) {
            throw new Error(
                `Idade fora do alcance permitido! 
                Idade inserida: ${age}
                Idade minima permitida: ${min}`
            );
        };
        if(age > max) {
            throw new Error(
                `Idade fora do alcance permitido! 
                Idade inserida: ${age}
                Idade máxima permitida: ${max}`
            );
        };
        this.value = age;
    };
};