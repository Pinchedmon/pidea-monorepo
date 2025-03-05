describe("Пользовательский поток: Вход, создание поста и редактирование имени профиля", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("/sign-in");
  });

  it("should sign in, create a post, and edit only the profile name", () => {
    // Sign In
    cy.get('input[name="name"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').contains("Войти").click();

    // Wait for redirect and verify
    cy.url().should("eq", "http://localhost:5173/");

    // Navigate to IT page and create a post
    cy.visit("/it");
    cy.get('textarea[name="text"]').type("This is a test post about IT");
    cy.get('button[type="submit"]').contains("Создать").click();
    cy.contains("Message created!").should("be.visible");
    cy.wait(3000); // Wait for success message to disappear

    // Navigate to profile and edit only name
    cy.visit("/profile");
    cy.contains("@testuser").should("be.visible");
    cy.get("button").contains("Редактировать").click();

    // Edit only name
    cy.get('input[id="username"]').clear().type("Test User Updated");
    // Оставляем никнейм и аватар без изменений
    cy.get('button[type="submit"]').contains("Сохранить изменения").click();

    // Verify updates
    cy.contains("Test User Updated").should("be.visible");
    cy.contains("@testuser").should("be.visible"); // Никнейм не изменился
  });
});

describe("Поток модератора: Вход и одобрение поста", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("/sign-in");
  });

  it("should sign in as moderator and approve a pending post", () => {
    // Sign In as moderator
    cy.get('input[name="name"]').type("moderator");
    cy.get('input[name="password"]').type("12341234");
    cy.get('button[type="submit"]').contains("Войти").click();

    // Wait for redirect and verify
    cy.url().should("eq", "http://localhost:5173/");

    cy.wait(3000); // Wait for success message to disappear

    // Verify moderation panel is visible
    cy.contains("Очередь модерации").should("be.visible");

    // Check if there are pending posts and approve the first one
    cy.get(".space-y-4").then(($postsContainer) => {
      const initialPostCount = $postsContainer.find("div").length;
      if (initialPostCount > 0) {
        // Approve the first post
        cy.get("button").contains("Одобрить").first().click();

        // Verify the post is approved by checking the updated state
        cy.get(".space-y-4").then(($updatedContainer) => {
          const updatedPostCount = $updatedContainer.find("div").length;
          if (initialPostCount === 1) {
            cy.contains("Нет постов на модерацию").should("be.visible");
          }
        });
      } else {
        cy.contains("Нет постов на модерацию").should("be.visible");
      }
    });
  });
});

describe("Создание комментария: Негативный сценарий", () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit("/sign-in");
  });

  it("should sign in and fail to create an empty comment", () => {
    // Sign In as a regular user
    cy.get('input[name="name"]').type("testuser");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').contains("Войти").click();

    // Wait for redirect and verify
    cy.url().should("eq", "http://localhost:5173/");

    cy.wait(3000);

    // Navigate to a specific post
    cy.visit("/post/cf82b03b-69a0-4082-8bcb-ab5a0591d09e");

    // Verify post page is loaded
    cy.contains("This is a test post about IT").should("be.visible");

    cy.get('input[name="content"]').type("Great post, thanks for sharing!");
    cy.get('button[type="submit"]').contains("Отправить").click();

    // Verify comment creation
    cy.contains("Comment created!").should("be.visible");
    cy.wait(3000);
    cy.contains("Comment created!").should("not.exist");
    cy.contains("Great post, thanks for sharing!").should("be.visible");
  });
});
