var sessionId = document.getElementById('sessionId').value;
var stripe = Stripe('pk_test_51PYl1V2LKtzuwR7pjyIEpXZyC7XsSiwZ4CoCgyznXDtaqWuYQNVZfki4ZcitucTRXOy6vmdeK7NuDjRry4FXzBNU006UJ7RmaT');
var orderBtn = document.getElementById('order-btn');
    orderBtn.addEventListener('click', function() {
            stripe.redirectToCheckout({
                sessionId: sessionId
            });
    });