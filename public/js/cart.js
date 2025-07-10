const BASE_URL = 'http://localhost:3000/api';


async function loadCart() {
    const res = await fetch(`${BASE_URL}/cart`);
    const resData = await res.json();
    renderCartList(resData);
    console.log(resData);
}

function renderCartList(cartItems) {
    const cartList = document.getElementById('cartList');

    cartList.innerHTML = '';
    cartItems.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML += `
        <td>${item.product_id}</td>
        <td>${item.name}</td>
        <td>${item.price}$</td>
        <td>${item.quantity}</td>
        <td>${item.created_at}</td>
        <td>${item.total_price}$</td>
        <td>
            <button onclick="updateCartItems('${item.product_id}', '${item.quantity}')">Edit</button>
            <button onclick="deleteCartItems('${item.product_id}')">Delete</button>
        </td>
        `
        cartList.appendChild(row)
    })
}

async function updateCartItems(product_id, oldQuantity) {
    const input = prompt('New quantity: ', oldQuantity);
    const newQuantity = parseInt(input, 10);

    if(newQuantity <= 0 || isNaN(newQuantity)) {
        alert("Please enter a valid number!");
        return;
    }

    const res = await fetch(`${BASE_URL}/cart/${product_id}`, {//Sửa lại fetch URL có đính kèm user_id
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({quantity: newQuantity})
    })

    if(res.ok) {
        loadCart();
    } else {
        alert("Error update item");
    }
}

async function clearCart() {
    if(confirm("Are you sure to clear all your cart ?")) {
        const res = await fetch(`${BASE_URL}/cart`, {
        method: 'DELETE'
        });

        if(res.ok) {
            loadCart();
        }else {
            alert("Error clearing item");
        }
    }
    

}

async function deleteCartItems(product_id) {
    if(confirm("Are you sure to delete this item ?")) {
        const res = await fetch(`${BASE_URL}/cart/${product_id}`, {
        method: 'DELETE'
        });

        if(res.ok) {
            loadCart();
        }else {
            alert("Error clearing item");
        }
    }
    
}

loadCart();