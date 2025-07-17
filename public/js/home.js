const BASE_URL = 'http://localhost:3000/api';
//Hiển thị và thay đổi User
function selectUser() {
  const user_id = document.getElementById('userSelect').value;
  localStorage.setItem('user_id', user_id);
  loadProducts();
}

function setTempUser() { //Kiểm tra user_id, nếu chưa có lấy mặc định us001
    const defaultUser = 'us001';
    if(!localStorage.getItem('user_id')) {
        localStorage.setItem('user_id', defaultUser);
    }
}

setTempUser();

//Load và Search sẽ lấy từ script của Product
async function loadProducts() { // Tải danh sách sản phẩm từ API
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;

  const res = await fetch(`${BASE_URL}/products?sortBy=${sortBy}&order=${sortOrder}`); // Gọi API với tham số sắp xếp
  const resData = await res.json();
  renderHome(resData.data);
}

async function searchProducts() {
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;

  const filter = document.getElementById('filter').value; // Lấy từ khóa tìm kiếm
  const res = await fetch(`${BASE_URL}/products/name?filter=${filter}&sortBy=${sortBy}&order=${sortOrder}`); // Gọi API với từ khóa tìm kiếm
  const resData = await res.json();
  console.log(resData)
  renderHome(resData.data);
}

//Hiển thị sản phẩm tương tự Products
async function renderHome(products) {
    const homeList = document.getElementById("homeList");

    homeList.innerHTML = '';
    products.forEach(p => {
        homeList.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.stock_quantity}</td>
        <td>
          <input type="Number" id="qty-${p.id}" placeholder="Enter a number" min="1" value="1">
          <button onclick="addToCart('${p.id}')">Add to cart</button>
          <button onclick="buyNow()">Buy</button>
        </td>
      </tr>
    `;
    })
}

//Các chức năng
async function addToCart(product_id) {
  const user_id = localStorage.getItem('user_id');
  const quantityInput = document.getElementById(`qty-${product_id}`);
  const quantity = parseInt(quantityInput.value, 10);

  console.log({quantity, user_id, product_id});

  if (!quantity || quantity <= 0) {
    alert("Please enter a valid quantity");
    return;
  }

  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify({product_id, user_id,quantity})
  });

  if(res.ok) {
    loadProducts();
  } else {
    alert("Error!")
  }
}

loadProducts();