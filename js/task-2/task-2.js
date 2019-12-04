

// '3d 1u 2d 0u' [1, 5, 8, 14, 12]

const mask = '3d 1u 2d 0u';
const list = [12, 14, 8, 5];


function sort(mask, list) {
    const priorities = mask.split(' ').map(function (bitWithDirection) {
        return {
            bitNumber: bitWithDirection[0],
            direction: bitWithDirection[1]
        }
    });

    list.sort(function (a, b) {
        const first = a.toString(2).padStart(priorities.length, '0');
        const second = b.toString(2).padStart(priorities.length, '0');

        for (let i = 0; i < priorities.length; i++) {
            const priority = priorities[i];
            const firstNumberBit = first[priority.bitNumber];
            const secondNumberBit = second[priority.bitNumber];
            const direction = priority.direction;

            if (direction === 'u') {
                if (firstNumberBit > secondNumberBit) return 1;
                if (firstNumberBit < secondNumberBit) return -1;
            } else {
                if (firstNumberBit > secondNumberBit) return -1;
                if (firstNumberBit < secondNumberBit) return 1;
            }
        }

        return 0;
    });

    for (let i = 0; i < list.length; i++) {
        console.log(`${list[i].toString().padEnd(2, ' ')}: ${list[i].toString(2).padStart(priorities.length, '0')}`);
    }
}

sort(mask, list);