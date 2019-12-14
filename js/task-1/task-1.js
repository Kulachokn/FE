function Fibo() {
    const f = (function * () {
        const A = [ 0, 1 ];
        let forward = true;
        while (true) {
            const flag = yield A[0];
            if ( typeof flag === 'boolean' ){
                forward = flag;
            }
            if ( forward ) {
                const next = A[0] + A[1];
                A.push( next );
                A.shift();
            } else {
                const prev = A[1] - A[0];
                A.unshift( prev );
                A.pop();
            }
        }
    })();
    return ( amount, flag ) => {
        const result = [];
        for ( let i = 0; i < amount; i++ ) {
            result.push( f.next( flag ).value );
        }
        return result;
    }
}

const f1 = Fibo();
for ( let i=1, f=true; i<15; i++ ) {
    if ( i==4 ) f=false;
    console.log( f1( i, f) );
}
