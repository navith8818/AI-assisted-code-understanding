#include <raylib.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define GRID_ROWS 15
#define GRID_COLS 15
#define CELL_SIZE 35
#define GRID_START_X 130
#define GRID_START_Y 30
#define MOVE_DELAY 0.2f

int grid[GRID_ROWS][GRID_COLS];

typedef enum {
    FOOD_APPLE,
    FOOD_EGG,
    FOOD_BOMB,
    FOOD_NONE
} FoodType;

Color DARK_GREEN = {162, 209, 73, 255};
Color LIGHT_GREEN = {170, 215, 81, 255};

// Singly Linked List

// node with x,y
typedef struct Node {
    int col;
    int row;

    float x;
    float y;

    float prevX;
    float prevY;
    struct Node* next;
} Node;

// linked list
typedef struct LinkedList{
    Node* head;
    Node* tail;
    int dirX, dirY;  
    int grow; 
} LinkedList;


// initialize linked list
LinkedList* initList(){
    LinkedList* list = (LinkedList*)malloc(sizeof(LinkedList));

    if (list == NULL){
        return NULL;
    }

    list->head = NULL;
    list->tail = NULL;

    return list;
}


// create node
Node* createNode(int col, int row){

    Node *newNode = (Node *)malloc(sizeof(Node));

    if(newNode == NULL){
        return NULL;
    }

    newNode->col = col;
    newNode->row = row;

    newNode->x = GRID_START_X + col * CELL_SIZE;
    newNode->y = GRID_START_Y + row * CELL_SIZE;

    newNode->prevX = newNode->x;
    newNode->prevY = newNode->y;

    newNode->next = NULL;

    return newNode;
}


// check if list is empty
int isEmpty(LinkedList* list){
    return (list->head == NULL);
}


// insert at head
void insertAtHead(LinkedList* list, int x, int y){

    Node* newNode = createNode(x,y);

    if(newNode == NULL) return;

    if(isEmpty(list)){
        list->head = newNode;
        list->tail = newNode;
    }
    else{
        newNode->next = list->head;
        list->head = newNode;
    }
}

void RemoveTail(LinkedList* list)
{
    if(list->head == list->tail)
    {
        free(list->head);
        list->head=NULL;
        list->tail=NULL;
        return;
    }

    Node* temp = list->head;

    while(temp->next != list->tail)
        temp=temp->next;

    free(list->tail);

    list->tail = temp;
    list->tail->next = NULL;
}




//Doubly Linked list chalaka
typedef struct Map{
    Texture2D MapName;
    struct Map* prev;
    struct Map* next;
} Map;


struct Map* createDoublyNode(Texture2D MapName){
    struct Map* newNode = (struct Map*)malloc(sizeof(struct Map));
    newNode->MapName = MapName;
    newNode->prev = NULL;
    newNode->next = NULL;
    return newNode;
}

typedef struct DoublyLinkedList{
    Map* head;
    Map* tail;
} DoublyLinkedList;

// initialize linked list
DoublyLinkedList* initDoublyList(){
    DoublyLinkedList* list = (DoublyLinkedList*)malloc(sizeof(DoublyLinkedList));

    if (list == NULL){
        return NULL;
    }

    list->head = NULL;
    list->tail = NULL;

    return list;
}


void insertNode(DoublyLinkedList* list,Texture2D MapName){
    Map* newNode = createDoublyNode(MapName);

    if(list->head == NULL){
        list->head = newNode;
        list->tail = newNode;
        newNode->next = newNode;  // Circular: points to itself
        newNode->prev = newNode;
    }
    else{

        list->tail->next = newNode;
        newNode->prev = list->tail;
        newNode->next = list->head;
        list->head->prev = newNode;
        list->tail = newNode;
    }
}
Map* moveForward(Map* current){
    if(current == NULL){
        printf("Carousel is empty!\n");
        return NULL;
    }
    return current = current->next;
}

// Move backward (previous item)
Map* moveBackward(Map* current){
    if(current == NULL){
        return NULL;
    }
    return current = current->prev;
}


// Node structure for queue
typedef struct QueueNode{
    int col;
    int row;
    FoodType type;
    struct QueueNode *next;
} QueueNode;

typedef struct {
    QueueNode *apple;     // always present
    QueueNode *special;   // egg or bomb, can be NULL
} ActiveFood;

// Queue structure with front and rear pointers
typedef struct {
    QueueNode *front;
    QueueNode *rear;
} Queue;

// Initialize an empty queue
Queue* initQueue() {
    Queue *queue = (Queue *)malloc(sizeof(Queue));
    if (queue == NULL) {
        return NULL;
    }
    queue->front = NULL;
    queue->rear = NULL;
    return queue;
}

// Create a new node
QueueNode* createQueueNode(int col, int row, FoodType type) {
    QueueNode *newNode = (QueueNode *)malloc(sizeof(QueueNode));
    if (newNode == NULL) {
        return NULL;
    }
    newNode->col = GRID_START_X + col * CELL_SIZE;
    newNode->row = GRID_START_Y + row * CELL_SIZE;
    newNode->type = type;
    newNode->next = NULL;
    return newNode;
}

// Check if queue is empty
int isQueueEmpty(Queue *queue) {
    return (queue->front == NULL);
}

// Enqueue: Add element to the rear of the queue
void enqueue(Queue *queue, int x, int y, FoodType type) {
    QueueNode *newNode = createQueueNode(x, y, type);
    if (newNode == NULL) {
        return;
    }
    
    if (isQueueEmpty(queue)) {
        queue->front = newNode;
        queue->rear = newNode;
    } else {
        queue->rear->next = newNode;
        queue->rear = newNode;
    }
}

// Dequeue: Remove element from the front of the queue
int dequeue(Queue *queue) {
    if (isQueueEmpty(queue)) {
        return -1;
    }
    
    QueueNode *temp = queue->front;
    FoodType type = temp->type;
    queue->front = queue->front->next;
    
    if (queue->front == NULL) {
        queue->rear = NULL;
    }
    
    free(temp);
    return type;
}


// Free the entire queue
void freeQueue(Queue *queue) {
    while (!isQueueEmpty(queue)) {
        dequeue(queue);
    }
    free(queue);
}

void InitGrid(int grid[GRID_ROWS][GRID_COLS]){
    for(int y = 0; y < GRID_ROWS; y++)
    {
        for(int x = 0; x < GRID_COLS; x++)
        {
            grid[y][x] = 0;
        }
    }
}

void DrawGameGrid(int grid[GRID_ROWS][GRID_COLS]){

    for(int row = 0; row < GRID_ROWS; row++)
        {
            for(int col = 0; col < GRID_COLS; col++)
            {
                int x = GRID_START_X + col * CELL_SIZE;
                int y = GRID_START_Y + row * CELL_SIZE;

                if((row + col) % 2 == 0)
                {
                    DrawRectangle(x, y, CELL_SIZE, CELL_SIZE, DARK_GREEN);
                }
                else
                {
                    DrawRectangle(x, y, CELL_SIZE, CELL_SIZE, LIGHT_GREEN); 
                }
            }
        }
}

void FadeToBlack(float speed, char text[])
{
    float alpha = 0.0f;

    while(alpha < 1.0f)
    {
        alpha += speed * GetFrameTime();    
        if(alpha > 1.0f) alpha = 1.0f;

        BeginDrawing();

        DrawText(text, 330, 250, 40, WHITE);

        DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), (Color){0, 0, 0, (unsigned char)(alpha * 255)});

        EndDrawing();
    }
}

LinkedList* InitSnake()
{
    LinkedList* snake = initList();

    int startX = 4;
    int startY = 4;

    insertAtHead(snake, startX, startY);
    insertAtHead(snake, startX, startY + 1);
    insertAtHead(snake, startX, startY + 2);
    insertAtHead(snake, startX, startY + 3);
    insertAtHead(snake, startX, startY + 4);
    insertAtHead(snake, startX, startY + 5);

    return snake;
}

float GetHeadRotation(int dirRow, int dirCol)
{
    if(dirRow==-1) return 90;
    if(dirRow==1) return 270;
    if(dirCol==-1) return 180;
    if(dirCol==1) return 0;

    return 0;
}

float GetTailRotation(LinkedList* snake)
{
    if(snake->head == snake->tail) return 0;

    Node* beforeTail = snake->head;

    while(beforeTail->next != snake->tail)
        beforeTail = beforeTail->next;

    int dr = snake->tail->row - beforeTail->row;
    int dc = snake->tail->col - beforeTail->col;

    if(dr==-1) return 0;
    if(dr==1) return 180;
    if(dc==-1) return 270;
    if(dc==1) return 90;

    return 0;
}

void DrawSnakePart(Texture2D tex,float x,float y,float rotation)
{
    Rectangle src={0,0,tex.width,tex.height};

    Rectangle dest={
        x+CELL_SIZE/2,
        y+CELL_SIZE/2,
        CELL_SIZE,
        CELL_SIZE
    };

    Vector2 origin={CELL_SIZE/2,CELL_SIZE/2};

    DrawTexturePro(tex,src,dest,origin,rotation,WHITE);
}

void DrawSnake(LinkedList* snake,Texture2D snakeHeadTex, Texture2D snakeTailTex, Texture2D snakeBodyTex,int dirRow, int dirCol)
{
    Node* temp = snake -> head;

    while(temp)
    {
        if(temp == snake->head)
        {
            DrawSnakePart(
                snakeHeadTex,
                temp->x,
                temp->y,
                GetHeadRotation(dirRow,dirCol)
            );
        }
        else if(temp == snake->tail)
        {
            DrawSnakePart(
                snakeTailTex,
                temp->x,
                temp->y,
                GetTailRotation(snake)
            );
        }
        else
        {
            if (temp == snake->head->next)
            {
            }else{
                DrawSnakePart(
                snakeBodyTex,
                temp->x,
                temp->y,
                GetHeadRotation(dirRow,dirCol)
            );
            }
            
        }

        temp=temp->next;
    }
}

void HandleInput(int *dirX, int *dirY)
{
    
    if((IsKeyPressed(KEY_UP) || IsKeyPressed(KEY_W) ) && *dirY != 1)
    {
        *dirX = 0;
        *dirY = -1;
    }

    if((IsKeyPressed(KEY_DOWN) || IsKeyPressed(KEY_S)) && *dirY != -1)
    {
        *dirX = 0;
        *dirY = 1;
    }

    if((IsKeyPressed(KEY_LEFT) || IsKeyPressed(KEY_A)) && *dirX != 1)
    {
        *dirX = -1;
        *dirY = 0;
    }

    if((IsKeyPressed(KEY_RIGHT) || IsKeyPressed(KEY_D)) && *dirX != -1)
    {
        *dirX = 1;
        *dirY = 0;
    }

}

bool CheckSelfCollision(LinkedList* snake, int row,int col)
{
    Node* temp = snake->head;

    while(temp)
    {
        if(temp->row == row && temp->col == col)
            return true;

        temp=temp->next;
    }

    return false;
}


float moveTimer=0;


void MoveSnake(LinkedList* snake, int dirCol,int dirRow, bool *gameOver, bool *grow, char *text1, char *text2 )
{
    if (!snake || !snake->head) return;

    int newCol = snake->head->col + dirCol;
    int newRow = snake->head->row + dirRow;

    if(newRow<0 || newRow >= GRID_ROWS || newCol < 0 || newCol >= GRID_COLS){
        strcpy(text1, "That wall came");
        strcpy(text2, "out of nowhere!");
        *gameOver=true;
    }
        

    if(CheckSelfCollision(snake, newRow, newCol)){
        strcpy(text1, "I think I tripped");
        strcpy(text2, "on my own tail...");
        *gameOver=true;
    }     

    Node* temp = snake->head;
    while (temp) {
        temp->prevX = GRID_START_X + temp->col * CELL_SIZE;
        temp->prevY = GRID_START_Y + temp->row * CELL_SIZE;
        temp = temp->next;
    }

    // STEP 2: Save old head grid position before inserting new head
    float oldHeadX = snake->head->prevX;
    float oldHeadY = snake->head->prevY;

    // STEP 3: Insert new head
    insertAtHead(snake, newCol, newRow);

    // STEP 4: New head animates FROM where old head was
    snake->head->prevX = oldHeadX;
    snake->head->prevY = oldHeadY;

    if(!*grow)
        RemoveTail(snake);
    else
        *grow=false;
    
}


void UpdateSmoothMovement(LinkedList* snake,float alpha)
{
    if(!snake || !snake->head) return;

    Node* prev = NULL;
    Node* temp = snake->head;

    while(temp)
    {
        float targetX, targetY;

        if(temp == snake->head)
        {
            // Head moves towards its current grid position
            targetX = GRID_START_X + temp->col * CELL_SIZE;
            targetY = GRID_START_Y + temp->row * CELL_SIZE;
        }
        else
        {
            // Body moves towards the previous node’s previous position
            targetX = prev->prevX;
            targetY = prev->prevY;
        }

        temp->x = temp->prevX + (targetX - temp->prevX) * alpha;
        temp->y = temp->prevY + (targetY - temp->prevY) * alpha;

        prev = temp;
        temp = temp->next;
    }
}

FoodType RandomSpecialFood()
{
    int r = GetRandomValue(0, 4);

    if(r == 0) return FOOD_EGG;
    if(r == 1) return FOOD_BOMB;

    return FOOD_NONE;
}

QueueNode* SpawnFood(LinkedList *snake, QueueNode* existfood, FoodType type)
{
    int col, row;

    do {
        col = GetRandomValue(0, GRID_COLS - 1);
        row = GetRandomValue(0, GRID_ROWS - 1);
    } while (CheckSelfCollision(snake, row, col) || (existfood != NULL && (existfood->col == col || existfood->row == row)) ); 

    QueueNode* food = createQueueNode(col,row,type);
    food->col = col;
    food->row = row;
    
    return food;
}

bool IsEating(LinkedList *snake, QueueNode* food)
{
    if (!food) return false; 
    return CheckSelfCollision(snake, food->row, food->col);
}

void TrySpawnSpecial(ActiveFood *active, LinkedList *snake)
{
    // only spawn if no special is currently active
    if (active->special != NULL) return;

    // 40% chance
    if (GetRandomValue(0, 99) >= 40) return;

    FoodType type = (GetRandomValue(0, 1) == 0) ? FOOD_EGG : FOOD_BOMB;
    active->special = SpawnFood(snake, active->apple, type);
}

void UpdateFood(ActiveFood *active, Queue *queue, LinkedList *snake, int *score, bool *grow, bool *gameOver, char *text1, char *text2)
{
    // --- Apple eaten ---
    if (IsEating(snake, active->apple))
    {
        free(active->apple);
        
        *score += 1;
        *grow = true;  // tell snake to grow

        if (active->special != NULL)
        {
           free(active->special);
           active->special = NULL;
        }

        // Spawn next apple immediately
        active->apple = SpawnFood(snake, NULL, FOOD_APPLE);

        // Maybe queue a special food
        TrySpawnSpecial(active, snake);

    }

    // --- Special food eaten ---
    if (IsEating(snake, active->special))
    {
        if (active->special->type == FOOD_EGG)
        {
            *score += 3;
            snake->grow = true;
        }
        else if (active->special->type == FOOD_BOMB)
        {
            strcpy(text1, "I thought it was");
            strcpy(text2, "a spicy grape!");
            *gameOver = true;
        }

        free(active->special);
        active->special = NULL;

    }
}

void DrawFood(ActiveFood *active, Texture2D appleTexture, Texture2D eggTexture, Texture2D bombTexture)
{
    if (active->apple)
    {
        int x = GRID_START_X + active->apple->col * CELL_SIZE;
        int y = GRID_START_Y + active->apple->row * CELL_SIZE;
        DrawTexture(appleTexture, x, y, WHITE);
    }

    if (active->special)
    {
        int x = GRID_START_X + active->special->col * CELL_SIZE;
        int y = GRID_START_Y + active->special->row * CELL_SIZE;

        if (active->special->type == FOOD_EGG)
            DrawTexture(eggTexture, x, y, WHITE);
        else if (active->special->type == FOOD_BOMB)
            DrawTexture(bombTexture, x, y, WHITE);
    }
}

typedef enum GameScreen {MENU, GAME, SCORES, EXIT_GAME} GameScreen;

GameScreen MenuScreen(Texture2D background, Texture2D logo, Texture2D button, Texture2D Score_button, Texture2D Exit_button, Music bgMusic) {

    Vector2 buttonPos = {370,170};
    float baseY = buttonPos.y;
    float hoverY = baseY - 5;

    Vector2 Score_buttonPos = {370,280};
    float Score_baseY = Score_buttonPos.y;
    float Score_hoverY = Score_baseY - 5;

    Vector2 Exit_buttonPos = {370,390};
    float Exit_baseY = Exit_buttonPos.y;
    float Exit_hoverY = Exit_baseY - 5;

    Rectangle buttonRec = {buttonPos.x, buttonPos.y, button.width, button.height};
    Rectangle ScoreRec  = {Score_buttonPos.x, Score_buttonPos.y, Score_button.width, Score_button.height};
    Rectangle ExitRec   = {Exit_buttonPos.x, Exit_buttonPos.y, Exit_button.width, Exit_button.height};


    while (!WindowShouldClose()) {  

        Vector2 mouse = GetMousePosition();
       
        UpdateMusicStream(bgMusic);
        

        bool hoveringAnyButton = false;

        // Play button
        if(CheckCollisionPointRec(mouse, buttonRec)) {
            hoveringAnyButton = true;

            if(buttonPos.y > hoverY)
                buttonPos.y -= 0.5;
        }
        else if(buttonPos.y < baseY) {
            buttonPos.y += 0.5;
        }

        // Score button
        if(CheckCollisionPointRec(mouse, ScoreRec)) {
            hoveringAnyButton = true;

            if(Score_buttonPos.y > Score_hoverY)
                Score_buttonPos.y -= 0.5;
        }
        else if(Score_buttonPos.y < Score_baseY) {
            Score_buttonPos.y += 0.5;
        }

        // Exit button
        if(CheckCollisionPointRec(mouse, ExitRec)) {
            hoveringAnyButton = true;

            if(Exit_buttonPos.y > Exit_hoverY)
                Exit_buttonPos.y -= 0.5;
        }
        else if(Exit_buttonPos.y < Exit_baseY) {
            Exit_buttonPos.y += 0.5;
        }


        // Set cursor ONCE
        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);

        // Click detection
        if(CheckCollisionPointRec(mouse, buttonRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return GAME;
        }
        if(CheckCollisionPointRec(mouse, ScoreRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return SCORES;
        }
        if(CheckCollisionPointRec(mouse, ExitRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return EXIT_GAME;
        }

        // Draw
        BeginDrawing();
        ClearBackground(BLACK);
        DrawTexture(background, 0, 0, WHITE);
        DrawTexture(logo, 370, 70, WHITE);
        DrawTexture(button, buttonPos.x, buttonPos.y, WHITE);
        DrawTexture(Score_button, Score_buttonPos.x, Score_buttonPos.y, WHITE);
        DrawTexture(Exit_button, Exit_buttonPos.x, Exit_buttonPos.y, WHITE);
        EndDrawing();
    }


    return EXIT_GAME;
}

GameScreen ReplayScreen(char *text1, char *text2){
    Texture2D Background = LoadTexture("Graphics/gameover bg.png");

    Texture2D Back_button = LoadTexture("Graphics/Back_Button.png");
    Sound lose = LoadSound("resources/lose.mp3");

    Music bgmusic = LoadMusicStream("resources/Camp Approach.mp3");
    SetMusicVolume(bgmusic, 0.3f);  
    PlayMusicStream(bgmusic);

    Texture2D dialog_box = LoadTexture("Graphics/dialog box.png");
    SetTextureFilter(dialog_box, TEXTURE_FILTER_BILINEAR);
    Rectangle source = {0, 0, dialog_box.width, dialog_box.height};
    Rectangle dest = {360, 30, 400, 200};
    Vector2 origin = {0, 0};

    Texture2D button = LoadTexture("Graphics/replay button.png");
    Vector2 buttonPos = {370,250};
    float baseY = buttonPos.y;
    float hoverY = baseY - 5;

    bool soundPlayed = false;
    
    while (!WindowShouldClose()){

        if (!soundPlayed)
        {
            PlaySound(lose);
            soundPlayed = true;
        }
        

        UpdateMusicStream(bgmusic);

        Vector2 mouse = GetMousePosition();
        Rectangle buttonRec = {buttonPos.x, buttonPos.y, button.width, button.height};

        Vector2 Back_buttonPos = {30,20};
        Rectangle BackRec   = {Back_buttonPos.x, Back_buttonPos.y, Back_button.width, Back_button.height};

        bool hoveringAnyButton = false;
        if(CheckCollisionPointRec(mouse, buttonRec)) {
            hoveringAnyButton = true;

            if(buttonPos.y > hoverY)
                buttonPos.y -= 0.5;
        }
        else if(buttonPos.y < baseY) {
            buttonPos.y += 0.5;
        }

        if(CheckCollisionPointRec(mouse, BackRec)) {
            hoveringAnyButton = true;
        }

        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);

        if(CheckCollisionPointRec(mouse, BackRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            UnloadTexture(Background);
            UnloadTexture(Back_button);
            UnloadTexture(dialog_box);
            UnloadTexture(button);
            return MENU;
        }
        if(CheckCollisionPointRec(mouse, buttonRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            UnloadTexture(Background);
            UnloadTexture(Back_button);
            UnloadTexture(dialog_box);
            UnloadTexture(button);
            return GAME;
        }

        BeginDrawing();
        ClearBackground(DARKGRAY);
        DrawTexture(Background, 0, 0, WHITE);

        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);
        DrawTexture(button, buttonPos.x, buttonPos.y, WHITE);
        DrawTexturePro(dialog_box, source, dest, origin, 0.0f, WHITE);
        DrawText(text1, 390, 80, 40, BLACK);
        DrawText(text2, 390, 130, 40, BLACK);
        

        EndDrawing();
    }
    UnloadTexture(Background);
    UnloadTexture(Back_button);
    UnloadTexture(dialog_box);
    UnloadTexture(button);
    UnloadSound(lose);
    return EXIT_GAME;

}

GameScreen MapScreen(Texture2D play_background,Texture2D Back_button){

    Texture2D SnakePart = LoadTexture("Graphics/SnakePart.png");
    Texture2D SnakeHead = LoadTexture("Graphics/SnakeHead.png");
    Texture2D SnakeTail = LoadTexture("Graphics/SnakeTail.png");

    Texture2D apple = LoadTexture("Graphics/Apple.png");
    Texture2D egg   = LoadTexture("Graphics/Egg.png");
    Texture2D bomb  = LoadTexture("Graphics/Bomb.png");

    Music gameplayMusic = LoadMusicStream("resources/MilkyWay.mp3");
    SetMusicVolume(gameplayMusic, 0.3f);  
    PlayMusicStream(gameplayMusic);

    Vector2 Back_buttonPos = {30,20};

    char text1[100], text2[100];

    int dirCol=0;
    int dirRow=1;

    int score;

    bool grow = false;
    bool gameOver = false;

    InitGrid(grid);

    LinkedList* snake = InitSnake();

    Queue *foodQueue  = initQueue();
    ActiveFood  activeFood;
    activeFood.apple = SpawnFood(snake, NULL , FOOD_APPLE);
    activeFood.special = NULL;



    while (!WindowShouldClose()){

        UpdateMusicStream(gameplayMusic);

        float dt = GetFrameTime();

        HandleInput(&dirCol, &dirRow);

        moveTimer += dt;

        while(moveTimer >= MOVE_DELAY && !gameOver){
            MoveSnake(snake, dirCol, dirRow,&gameOver, &grow, text1, text2);
            moveTimer -= MOVE_DELAY;
        }
        UpdateFood(&activeFood, foodQueue, snake, &score, &grow, &gameOver, text1, text2);

        if(gameOver){
            free(snake);
            UnloadTexture(SnakePart);
            UnloadTexture(SnakeHead);
            UnloadTexture(SnakeTail);
            UnloadTexture(apple);
            UnloadTexture(egg);
            UnloadTexture(bomb);
            StopMusicStream(gameplayMusic);
            UnloadMusicStream(gameplayMusic);
            return ReplayScreen(text1,text2);
        }

 

        float alpha = moveTimer / MOVE_DELAY;

        UpdateSmoothMovement(snake, alpha);

        Vector2 mouse = GetMousePosition();
        Rectangle BackRec   = {Back_buttonPos.x, Back_buttonPos.y, Back_button.width, Back_button.height};

        bool hoveringAnyButton = false;

        if(CheckCollisionPointRec(mouse, BackRec)) {
            hoveringAnyButton = true;
        }

        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);

        if(CheckCollisionPointRec(mouse, BackRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            free(snake);
            UnloadTexture(SnakePart);
            UnloadTexture(SnakeHead);
            UnloadTexture(SnakeTail);
            UnloadTexture(apple);
            UnloadTexture(egg);
            UnloadTexture(bomb);
            StopMusicStream(gameplayMusic);
            UnloadMusicStream(gameplayMusic);

            return GAME;
        }
        

        BeginDrawing();
        ClearBackground(BLACK);

        DrawGameGrid(grid);
        DrawTexture(play_background, 0, 0, WHITE);
        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);

        DrawFood(&activeFood, apple, egg, bomb);

        DrawSnake(snake,SnakeHead,SnakeTail,SnakePart,dirCol,dirRow);

        EndDrawing();
    }
    
    free(snake);
    StopMusicStream(gameplayMusic);
    UnloadMusicStream(gameplayMusic);
    return EXIT_GAME;
}


GameScreen ScoreScreen(Texture2D Back_button, Music bgMusic){


    Vector2 Back_buttonPos = {30,20};


    while (!WindowShouldClose()){

        UpdateMusicStream(bgMusic);

        Vector2 mouse = GetMousePosition();
        Rectangle BackRec   = {Back_buttonPos.x, Back_buttonPos.y, Back_button.width, Back_button.height};

        bool hoveringAnyButton = false;

        if(CheckCollisionPointRec(mouse, BackRec)) {
            hoveringAnyButton = true;
        }

        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);

        if(CheckCollisionPointRec(mouse, BackRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return MENU;
        }

        BeginDrawing();
        ClearBackground(DARKGRAY);

        DrawText("Score Board", 300, 50, 40, GOLD);
        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);

        EndDrawing();
    }
    return EXIT_GAME;
}
DoublyLinkedList* InitCarousel(Texture2D Map1,Texture2D Map2,Texture2D Map3,Texture2D Map4){
   
    DoublyLinkedList* carousel = initDoublyList();

    insertNode(carousel,Map1);
    insertNode(carousel,Map2);
    insertNode(carousel,Map3);
    insertNode(carousel,Map4);

    return carousel;
}

GameScreen SelectMap(Texture2D Back_button, Music bgMusic){

    
    Texture2D map_background = LoadTexture("Graphics/map background.png");
    Texture2D Map1 = LoadTexture("Graphics/Map 1.png");
    Texture2D Map2 = LoadTexture("Graphics/Map 2.jpeg");
    Texture2D Map3 = LoadTexture("Graphics/Map 3.jpeg");
    Texture2D Map4 = LoadTexture("Graphics/Map 4.jpeg");
    Texture2D select_button = LoadTexture("Graphics/select button.png");
    Texture2D BackWard_button = LoadTexture("Graphics/backward.png");
    Texture2D ForWard_button = LoadTexture("Graphics/forward.png");
    

    SetTextureFilter(Map1, TEXTURE_FILTER_BILINEAR);
    SetTextureFilter(Map2, TEXTURE_FILTER_BILINEAR);
    SetTextureFilter(Map3, TEXTURE_FILTER_BILINEAR);
    SetTextureFilter(Map4, TEXTURE_FILTER_BILINEAR);

    DoublyLinkedList* carousel = InitCarousel(Map1,Map2,Map3,Map4);

    Map *PrevMap, *currentMap, *NextMap;

    currentMap = carousel->head;
    PrevMap = currentMap->prev;
    NextMap = currentMap->next;


    Vector2 select_buttonPos = {220,470};
    float select_baseY = select_buttonPos.y;
    float select_hoverY = select_baseY - 5;

    Vector2 Back_buttonPos = {30,20};
    Vector2 Backward_buttonPos = {300,420};
    Vector2 Forward_buttonPos = {460,420};

    Rectangle source_selected = {0, 0, PrevMap->MapName.width, PrevMap->MapName.height};
    Rectangle dest_selected = {200, 100, 400, 300}; // scaled down
    Vector2 origin_selected = {0, 0};

    Rectangle source_next = {0, 0, currentMap->MapName.width, currentMap->MapName.height};
    Rectangle dest_next = {500, 125, 350, 250}; // scaled down
    Vector2 origin_next = {0, 0};

    Rectangle source_prev = {0, 0, NextMap->MapName.width, NextMap->MapName.height};
    Rectangle dest_prev = {-50, 125, 350, 250}; // scaled down
    Vector2 origin_prev = {0, 0};

    Rectangle SelectRec   = {select_buttonPos.x, select_buttonPos.y, select_button.width, select_button.height};

    Rectangle BackRec   = {Back_buttonPos.x, Back_buttonPos.y, Back_button.width, Back_button.height};
    Rectangle BackwardRec   = {Backward_buttonPos.x, Backward_buttonPos.y, BackWard_button.width, BackWard_button.height};
    Rectangle ForwardRec   = {Forward_buttonPos.x, Forward_buttonPos.y, ForWard_button.width, ForWard_button.height};

    while (!WindowShouldClose()){

        Vector2 mouse = GetMousePosition();

        UpdateMusicStream(bgMusic);
        
        bool hoveringAnyButton = false;

        if(CheckCollisionPointRec(mouse, BackRec) || CheckCollisionPointRec(mouse, BackwardRec) || CheckCollisionPointRec(mouse, ForwardRec)) {
            hoveringAnyButton = true;
        }

        if(CheckCollisionPointRec(mouse, BackRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return MENU;
        }

        if(CheckCollisionPointRec(mouse, SelectRec)) {
            hoveringAnyButton = true;

            if(select_buttonPos.y > select_hoverY)
                select_buttonPos.y -= 0.5;
        }
        else if(select_buttonPos.y < select_baseY) {
            select_buttonPos.y += 0.5;
        }

        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);


        if(CheckCollisionPointRec(mouse, SelectRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            FadeToBlack(2.5f,"Loading...");
            StopMusicStream(bgMusic);
            return MapScreen(currentMap->MapName,Back_button);
        }

        if(IsKeyPressed(KEY_RIGHT) || (CheckCollisionPointRec(mouse, ForwardRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)))
        {
            currentMap = moveForward(currentMap);
            PrevMap = currentMap->prev;
            NextMap = currentMap->next;
            
        }

        if(IsKeyPressed(KEY_LEFT) || (CheckCollisionPointRec(mouse, BackwardRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)))
        {
            currentMap = moveBackward(currentMap);
            PrevMap = currentMap->prev;
            NextMap = currentMap->next;
        }



        BeginDrawing();
        ClearBackground(DARKGRAY);
        DrawTexture(map_background, 0, 0, WHITE);
        
        DrawText("Select The Map", 230, 30, 40, GOLD);
        
        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);
        

        DrawTexturePro(NextMap->MapName, source_next, dest_next, origin_next, 0.0f, WHITE);

        DrawTexturePro(PrevMap->MapName, source_prev, dest_prev, origin_prev, 0.0f, WHITE);
        
        DrawTexturePro(currentMap->MapName, source_selected, dest_selected, origin_selected, 0.0f, WHITE);


        DrawTexture(select_button, select_buttonPos.x, select_buttonPos.y, WHITE);
        DrawTexture(BackWard_button, Backward_buttonPos.x, Backward_buttonPos.y, WHITE);
        DrawTexture(ForWard_button, Forward_buttonPos.x, Forward_buttonPos.y, WHITE);

        EndDrawing();
    }
    return EXIT_GAME;
}

int main() {

    InitWindow(800, 600, "Snake POP");
    SetTargetFPS(60);

    // Load textures
    Texture2D background = LoadTexture("Graphics/background 2.png");
    Texture2D logo = LoadTexture("Graphics/snake pop.png");
    Texture2D button = LoadTexture("Graphics/start button.png");
    Texture2D Score_button = LoadTexture("Graphics/score board.png");
    Texture2D Exit_button = LoadTexture("Graphics/exit button.png");
    Texture2D Back_button = LoadTexture("Graphics/Back_Button.png");

    InitAudioDevice();
    Music bgMusic = LoadMusicStream("resources/Fastfall.mp3");
    SetMusicVolume(bgMusic, 0.3f);  
    


    // Current screen
    GameScreen currentScreen = MENU;

    while (!WindowShouldClose()) {
        PlayMusicStream(bgMusic);
        UpdateMusicStream(bgMusic);

        BeginDrawing();
        ClearBackground(BLACK);

        switch(currentScreen) {

            case MENU: currentScreen = MenuScreen(background, logo, button, Score_button, Exit_button,bgMusic);
                 break; 

            case GAME: currentScreen = SelectMap(Back_button,bgMusic);
                break;

            case SCORES: currentScreen = ScoreScreen(Back_button,bgMusic);
                 break;

            case EXIT_GAME: return 0;
                break;
        }

        EndDrawing();
    }

    // Cleanup
    UnloadTexture(button);
    UnloadTexture(Score_button);
    UnloadTexture(Exit_button);
    UnloadTexture(background);
    StopMusicStream(bgMusic);
    UnloadMusicStream(bgMusic);
    CloseAudioDevice();

    CloseWindow();
    return 0;
}