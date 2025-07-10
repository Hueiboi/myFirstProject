const BASE_URL = 'http://localhost:3000/api'; // Đổi nếu backend bạn đang dùng port khác

//PRODUCT
async function loadProducts() { // Tải danh sách sản phẩm từ API
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;

  const res = await fetch(`${BASE_URL}/products?sortBy=${sortBy}&order=${sortOrder}`); // Gọi API với tham số sắp xếp
  const resData = await res.json();
  renderProductList(resData.data);
}

async function searchProducts() {
  const sortBy = document.getElementById('sortBy').value;
  const sortOrder = document.getElementById('sortOrder').value;

  const filter = document.getElementById('filter').value; // Lấy từ khóa tìm kiếm
  const res = await fetch(`${BASE_URL}/products/name?filter=${filter}&sortBy=${sortBy}&order=${sortOrder}`); // Gọi API với từ khóa tìm kiếm
  const resData = await res.json();
  renderProductList(resData.data);
} // Tìm kiếm sản phẩm theo tên

//=> Gọi API, lấy về danh sách sản phẩm và hiển thị

async function createProduct() { // Tạo sản phẩm mới
  const name = document.getElementById('name').value;
  const id = document.getElementById('id').value;
  const price = document.getElementById('price').value;

  const res = await fetch(`${BASE_URL}/products`, { // Gửi dữ liệu lên server
    method: 'POST', // Phương thức POST để tạo mới
    headers: {'Content-Type': 'application/json'}, // Đặt header để thông báo dữ liệu là JSON
    body: JSON.stringify({ name, id,  price }) // Chuyển đổi đối tượng thành chuỗi JSON
  });

  if (res.ok) {
    loadProducts();
    document.getElementById('name').value = '';
    document.getElementById('id').value = '';
    document.getElementById('price').value = '';
  } else {
    const error = await res.json();
    alert('Error: ' + JSON.stringify(error.errors));
  }
}
//=> Gửi dữ liệu từ form lên server -> thêm vào database -> cập nhật lại danh sách sản phẩm

async function deleteProduct(id) {
  if(confirm("Are you sure?")){ // Xác nhận trước khi xóa
    await fetch(`${BASE_URL}/products/${id}`, {method: 'DELETE'});
  }
  loadProducts();
}

//=> Gửi ID cần xóa, cập nhật lại giao diện

async function updateProduct(id, name, price, stock_quantity) { // Cập nhật sản phẩm
  const newName = prompt("New name:", name);
  const newPrice = prompt("New price:", price);
  const newQuantity = prompt("New Quantity:", stock_quantity);

  if (newName && newPrice && newQuantity) {
    await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name: newName, price: parseFloat(newPrice), stock_quantity: parseInt(newQuantity) })
    });
    loadProducts();
  }
}
//=> Chỉnh sửa sản phẩm bằng cách hiển thị prompt để nhập tên và giá mới, gửi lên server

function renderProductList(products) { // Hiển thị danh sách sản phẩm
  const list = document.getElementById('productList');
  console.log(products);
  list.innerHTML = '';
  products.forEach(p => {
    list.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.stock_quantity}</td>
        <td>
          <button onclick="updateProduct('${p.id}', '${p.name}', '${p.price}', ${p.stock_quantity})">Edit</button>
          <button onclick="deleteProduct('${p.id}')">Delete</button>
          <input type="number" min="1" max="${p.stock_quantity}" placeholder="quantity">
          <button onclick="addToCart()">Add to cart </button>
          </td>
      </tr>
    `;
  });
}
//=> Duyệt qua danh sách sản phẩm, tạo các dòng table tương ứng và thêm nút chỉnh sửa/xóa

loadProducts(); // Tải dữ liệu ban đầu


//CART
