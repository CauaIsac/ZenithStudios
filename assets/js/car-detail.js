console.log("car-detail.js carregado ✅");

// 1. PEGAR O ID DA URL
const urlParams = new URLSearchParams(window.location.search);
const carId = urlParams.get("id");

// Se não tiver ID, mostrar erro
if (!carId) {
  alert("ID do veículo não encontrado.");
  throw new Error("ID do carro não foi informado.");
}

// 2. BUSCAR O CARRO NO SUPABASE
async function loadCarDetails() {
  try {
    const { data, error } = await supabase
      .from("inventory_cars")
      .select("*")
      .eq("id", carId)
      .single();

    if (error) throw error;

    console.log("➡️ Carregando veículo:", data);

    fillCarPage(data);

  } catch (err) {
    console.error("Erro ao carregar os detalhes do carro:", err.message);
  }
}

// 3. PREENCHER A PÁGINA
function fillCarPage(car) {

  // ------- GALERIA DE IMAGENS -------
  const thumbnails = document.getElementById("imageThumbnails");
  const mainImage = document.getElementById("mainCarImage");

  const imagens = [car.imagem_1, car.imagem_2, car.imagem_3].filter(Boolean);

  // Inserir miniaturas
  thumbnails.innerHTML = imagens
    .map(
      (img, index) =>
        `<img src="${img}" class="${index === 0 ? "active" : ""}">`
    )
    .join("");

  // Imagem inicial
  mainImage.src = imagens[0];

  // Miniatura → Imagem Principal
  const thumbs = thumbnails.querySelectorAll("img");
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
      mainImage.src = thumb.src;
    });
  });

  // ------- INFORMAÇÕES DO CARRO -------
  document.querySelector(".header-info h1").innerHTML =
    `${car.brand} <span>${car.name}</span>`;

  document.querySelector(".price-tag").textContent =
    `R$ ${Number(car.price).toLocaleString("pt-BR")}`;

  document.querySelector(".location p").textContent =
    car.localizacao || "Localização não informada";

  document.querySelector(".seller-info p").innerHTML =
    `Vendedor: ${car.vendedor || "Não informado"}`;

  // ------- DESCRIÇÃO -------
  document.querySelector(".description-box p").textContent =
    car.descricao || "Sem descrição disponível.";

  // ------- BOTÃO WHATSAPP -------
  const whatsappButton = document.querySelector(".whatsapp-button");
  whatsappButton.addEventListener("click", () => {
    openWhatsappModal(car);
  });
}

// 4. MODAL WHATSAPP
function openWhatsappModal(car) {
  const modal = document.getElementById("whatsappModal");
  const closeBtn = document.querySelector(".modal .close");

  modal.style.display = "flex";

  closeBtn.onclick = () => (modal.style.display = "none");

  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = "none";
  };

  const form = document.getElementById("whatsappForm");

  form.onsubmit = function (e) {
    e.preventDefault();

    const nome = form.nome.value;
    const oferta = form.oferta.value;
    const perguntas = form.perguntas.value;

    const msg =
      `*Olá! Meu nome é ${nome}*\n\n` +
      `Estou interessado no veículo *${car.brand} ${car.name}*.\n` +
      `Preço: R$ ${Number(car.price).toLocaleString("pt-BR")}\n` +
      (oferta ? `Minha oferta: R$ ${Number(oferta).toLocaleString("pt-BR")}\n` : "") +
      (perguntas ? `\nPergunta(s):\n${perguntas}` : "");

    const phone = "55" + "11999999999"; // coloque o número padrão do vendedor se quiser

    const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    window.open(whatsappURL, "_blank");
  };
}

// === INICIAR ===
loadCarDetails();
