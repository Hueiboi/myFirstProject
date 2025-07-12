const BASE_URL = 'http://localhost:3000/api';

function setTempUser() { //Kiểm tra user_id, nếu chưa có lấy mặc định us001
    const defaultUser = 'us001';
    if(!localStorage.getItem('user_id')) {
        localStorage.setItem('user_id', defaultUser);
    }
}

setTempUser();

//Người dùng có thể có nhiều tài khoản, hiện là select cơ bản
//Sau khi có đăng ký sẽ sử dụng token để tách các tài khoản riêng theo id
function selectUser() { 
    const user_id = document.getElementById('userSelect').value;
    localStorage.setItem('user_id', user_id);
    loadCart();
}

async function loadCart() {
    document.getElementById('currentUser').textContent = `${localStorage.getItem('user_id')}'s Cart`;
    const user_id = localStorage.getItem('user_id');
    const res = await fetch(`${BASE_URL}/cart?user_id=${user_id}`);
    const resData = await res.json();
    renderCartList(resData);
    console.log(user_id);
}

/*Solution hiện tại: 
    1. Tạm thời lưu user_id vào local storage
    2. Sử dụng từ local storage để fetch
    => Sau này sử dụng JWT khi có hệ thống đăng nhập đầy đủ
    Sau khi người dùng đăng nhập, bạn trả về JWT token chứa user_id
    Token này được lưu ở localStorage hoặc cookie
    Khi gọi API, bạn gửi kèm token trong header

*/

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

    const res = await fetch(`${BASE_URL}/cart/${product_id}?user_id=${user_id}`, {//Sửa lại fetch URL có đính kèm user_id
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
        const res = await fetch(`${BASE_URL}/cart/${product_id}?user_id=${user_id}`, {
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