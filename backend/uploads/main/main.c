#include <raylib.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define GRID_ROWS 15
#define GRID_COLS 15
#define CELL_SIZE 35
#define GRID_START_X 130
#define GRID_START_Y 30
#define MAX_SAVED_STEPS 5

Color button_orange = { 239, 55, 25, 255 };

typedef enum {
    FOOD_APPLE,
    FOOD_EGG,
    FOOD_BOMB,
    ABILITY_2x,
    ABILITY_REVIVE,
    ABILITY_SLOW,
    FOOD_NONE
} FoodType;

typedef enum {
    PLAYING,
    PAUSED,
    TUTORIAL
} GameState;

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
        newNode->next = newNode; 
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
    QueueNode *apple;    
    QueueNode *special;
    QueueNode *special1;
    QueueNode *special2;   
    QueueNode *ability; 
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
QueueNode* FoodNode(int col, int row, FoodType type) {
    QueueNode *newNode = (QueueNode *)malloc(sizeof(QueueNode));
    if (newNode == NULL) {
        return NULL;
    }
    newNode->col = col;
    newNode->row = row;
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
    QueueNode *newNode = FoodNode(x, y, type);
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

// Remove element from the front of the queue
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

// Queue for store Score

typedef struct scoreNode{
    int score;
    struct scoreNode* next;
} scoreNode;

scoreNode* createScoreNode(int score) {
    scoreNode *newNode = (scoreNode *)malloc(sizeof(scoreNode));
    if (newNode == NULL) {
        return NULL;
    }
    newNode->score = score;

    newNode->next = NULL;
    return newNode;
}

typedef struct {
    scoreNode *head;
    scoreNode *tail;
} ScoreList;

ScoreList* initScoreList() {
    ScoreList *list = (ScoreList *)malloc(sizeof(ScoreList));
    if (list == NULL) {
        return NULL;
    }
    list->head = NULL;
    list->tail = NULL;
    return list;
}

int isScoreListEmpty(ScoreList *list) {
    return (list->head == NULL);
}

void insertScore(ScoreList *list, int score) {
    scoreNode *newNode = createScoreNode(score);
    if (newNode == NULL) {
        return;
    }

    if (isScoreListEmpty(list)) {
        list->head = newNode;
        list->tail = newNode;
    } else {
        newNode->next = list->head;
        list->head = newNode;
    }
}

//Stack for health bar

typedef struct StackNode {
    int x;
    int y;
    struct StackNode* next;
} StackNode;

typedef struct Stack {
    StackNode* top;
} Stack;

Stack*  initialize() {
    Stack* stack = (Stack *)malloc(sizeof(Stack));
    stack->top = NULL;
    return stack;
}

StackNode* createHealthNode(int x, int y) {
    StackNode *newNode = (StackNode *)malloc(sizeof(StackNode));
    if (newNode == NULL) {
        return NULL;
    }
    newNode->x = x;
    newNode->y = y;
    newNode->next = NULL;
    return newNode;
}

void push(Stack* stack, int x, int y) {
    StackNode* newNode = createHealthNode(x, y);

    newNode->next = stack->top;
    stack->top = newNode;
}

void pop(Stack* stack) {

    StackNode* temp = stack->top;
    if(temp == NULL) return;

    stack->top = temp->next;
    free(temp);

}

//Insertion Sort

void insertionSort(int scoreArray[], int size){

    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - i - 1; j++) {
            if (scoreArray[j] < scoreArray[j + 1]) {  // 🔁 changed
                int temp = scoreArray[j];
                scoreArray[j] = scoreArray[j + 1];
                scoreArray[j + 1] = temp;
            }
        }
    }
}

// Stack for revive ability

typedef struct snakeStackNode {
    LinkedList* list;
    int dirCol;
    int dirRow;
    struct snakeStackNode* next;
} snakeStackNode;

snakeStackNode* createSnakeNode(LinkedList* list, int dirCol, int dirRow) {
    snakeStackNode *newNode = (snakeStackNode *)malloc(sizeof(snakeStackNode));
    if (newNode == NULL) return NULL;
    newNode->list   = list;
    newNode->dirCol = dirCol;
    newNode->dirRow = dirRow;
    newNode->next   = NULL;
    return newNode;
}

typedef struct SnakeStack {
    snakeStackNode* top;
    int size;
} SnakeStack;

void pushSnake(SnakeStack* stack, LinkedList* list, int dirCol, int dirRow) {
    snakeStackNode* newNode = createSnakeNode(list, dirCol, dirRow);
    if (!newNode) return;
    newNode->next = stack->top;
    stack->top = newNode;
    stack->size++;
}
LinkedList* popSnake(SnakeStack* stack) {
    if (!stack->top) return NULL;

    snakeStackNode* temp = stack->top;
    LinkedList* list = temp->list;

    stack->top = temp->next;
    stack->size--;
    free(temp);        

    return list;      
}

LinkedList* peekSnake(SnakeStack* stack, int n) {
    snakeStackNode* temp = stack->top;
    for (int i = 0; i < n && temp; i++) {
        temp = temp->next;
    }
    return temp ? temp->list : NULL;
}

void FreeSnake(LinkedList* snake) {
    if (!snake) return;
    Node* temp = snake->head;
    while (temp) {
        Node* next = temp->next;
        free(temp);
        temp = next;
    }
    free(snake);
}

void freeSnakeStack(SnakeStack* stack) {
    while (stack->top) {
        LinkedList* list = popSnake(stack);
        FreeSnake(list);
    }
    free(stack);
}

SnakeStack* initSavedSnake() {
    SnakeStack* stack = (SnakeStack*)malloc(sizeof(SnakeStack));
    stack->top  = NULL;
    stack->size = 0;
    return stack;
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

void FadeToBlack(float speed, char text[])
{
    float alpha = 0.0f;

    while(alpha < 1.0f)
    {
        alpha += speed * GetFrameTime();    
        if(alpha > 1.0f) alpha = 1.0f;

        BeginDrawing();

        DrawText(text, 300, 260, 40, WHITE);

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

DoublyLinkedList* InitCarousel(Texture2D Map1,Texture2D Map2,Texture2D Map3,Texture2D Map4){
   
    DoublyLinkedList* carousel = initDoublyList();

    insertNode(carousel,Map1);
    insertNode(carousel,Map2);
    insertNode(carousel,Map3);
    insertNode(carousel,Map4);

    return carousel;
}

float GetHeadRotation(int dirRow, int dirCol, int dirColSaved, int dirRowSaved)
{
    if(dirCol != 0 || dirRow != 0){

        if(dirRow==-1) return 90;
        if(dirRow==1) return 270;
        if(dirCol==-1) return 180;
        if(dirCol==1) return 0;
    }else{
        if(dirRowSaved==-1) return 180;
        if(dirRowSaved==1) return 0;
        if(dirColSaved==-1) return 90;
        if(dirColSaved==1) return 270;
    }

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

void DrawSnake(LinkedList* snake,Texture2D snakeHeadTex, Texture2D snakeTailTex, Texture2D snakeBodyTex,int dirRow, int dirCol, int dirColSaved, int dirRowSaved)
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
                GetHeadRotation(dirRow,dirCol,dirColSaved,dirRowSaved)
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
                GetHeadRotation(dirRow,dirCol,dirColSaved,dirRowSaved)
            );
            }
            
        }

        temp=temp->next;
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

            targetX = GRID_START_X + temp->col * CELL_SIZE;
            targetY = GRID_START_Y + temp->row * CELL_SIZE;
        }
        else
        {

            targetX = prev->prevX;
            targetY = prev->prevY;
        }

        temp->x = temp->prevX + (targetX - temp->prevX) * alpha;
        temp->y = temp->prevY + (targetY - temp->prevY) * alpha;

        prev = temp;
        temp = temp->next;
    }
}

LinkedList* CopySnake(LinkedList* snake) {
    LinkedList* copy = initList();
    if (!snake || !snake->head) return copy;

    int cols[100], rows[100];
    int count = 0;

    Node* temp = snake->head;
    while (temp) {
        cols[count] = temp->col;
        rows[count] = temp->row;
        count++;
        temp = temp->next;
    }

    for (int i = count - 1; i >= 0; i--) {
        insertAtHead(copy, cols[i], rows[i]);
    }

    return copy;
}

void saveMovements(LinkedList* snake, SnakeStack* movements, int dirCol, int dirRow) {
    LinkedList* snapshot = CopySnake(snake);
    pushSnake(movements, snapshot, dirCol, dirRow);

    // Keep only last 5
    if (movements->size > MAX_SAVED_STEPS) {
        snakeStackNode* temp = movements->top;
        while (temp->next->next) {
            temp = temp->next;
        }
        FreeSnake(temp->next->list);
        free(temp->next);
        temp->next = NULL;
        movements->size--;
    }
}

void revive(LinkedList** snake, SnakeStack* movements, int* dirCol, int* dirRow) {
    if (!movements->top) return;

    LinkedList* target = NULL;
    int savedDirCol = *dirCol;
    int savedDirRow = *dirRow;

    while (movements->top) {
        if (target) FreeSnake(target);

        // Save direction before popping
        savedDirCol = movements->top->dirCol;
        savedDirRow = movements->top->dirRow;

        target = popSnake(movements);
    }

    if (!target) return;

    *snake  = CopySnake(target);
    *dirCol = savedDirCol;  
    *dirRow = savedDirRow;
    FreeSnake(target);
}

FoodType RandomSpecialFood()
{

    if(GetRandomValue(0, 99) >= 90){
        return FOOD_EGG;
    }else{
        return FOOD_BOMB;
    }
 
}
FoodType RandomAbility()
{
    int random = GetRandomValue(0, 99);
    if(random >= 70){
        return ABILITY_2x;
    }else if(random >= 40){
        return ABILITY_REVIVE;
    }else{
        return ABILITY_SLOW;
    }
 
}

QueueNode* SpawnFood(LinkedList *snake, ActiveFood* existfoods, FoodType type)
{
    int col, row;

    do {
        col = GetRandomValue(0, GRID_COLS - 1);
        row = GetRandomValue(0, GRID_ROWS - 1);
    } while (CheckSelfCollision(snake, row, col) || 
            (existfoods->apple != NULL && (existfoods->apple->col == col && existfoods->apple->row == row)) || 
            (existfoods->special != NULL && (existfoods->special->col == col && existfoods->special->row == row)) ||
            (existfoods->ability != NULL && (existfoods->ability->col == col && existfoods->ability->row == row))
        ); 

    QueueNode* food = FoodNode(col,row,type);

    return food;
}

bool IsEating(LinkedList *snake, QueueNode* food)
{
    if (!food) return false; 
    return CheckSelfCollision(snake, food->row, food->col);
}

void TrySpawnSpecial(ActiveFood *active, LinkedList *snake)
{

    if (GetRandomValue(0, 99) >= 40){
        FoodType type = RandomAbility();
        active->ability = SpawnFood(snake, active, type);
    };

    if (GetRandomValue(0, 99) >= 60) return;
    FoodType type = RandomSpecialFood();
    active->special = SpawnFood(snake, active, type);

    if (GetRandomValue(0, 99) >= 60) return;
    type = RandomSpecialFood();
    active->special1 = SpawnFood(snake, active, type);

    if (GetRandomValue(0, 99) >= 80) return;
    type = RandomSpecialFood();
    active->special2 = SpawnFood(snake, active, type);
}

bool ReviveScreen(char *text1, char *text2){
    Texture2D Background = LoadTexture("Graphics/gameover bg.png");

    Sound lose = LoadSound("resources/lose.mp3");

    Music bgmusic = LoadMusicStream("resources/Camp Approach.mp3");
    SetMusicVolume(bgmusic, 0.5f);  
    PlayMusicStream(bgmusic);

    Texture2D dialog_box = LoadTexture("Graphics/dialog box.png");
    SetTextureFilter(dialog_box, TEXTURE_FILTER_BILINEAR);
    Rectangle source = {0, 0, dialog_box.width, dialog_box.height};
    Rectangle dest = {360, 30, 400, 200};
    Vector2 origin = {0, 0};

    Texture2D button = LoadTexture("Graphics/respawn.png");
    Vector2 buttonPos = {370,250};
    float baseY = buttonPos.y;
    float hoverY = baseY - 5;

    Texture2D Quit_button = LoadTexture("Graphics/quit.png");
    Vector2 Quit_buttonPos = {370,350};
    float Quit_baseY = Quit_buttonPos.y;
    float Quit_hoverY = Quit_baseY - 5;

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
        Rectangle QuitRec  = {Quit_buttonPos.x, Quit_buttonPos.y, Quit_button.width, Quit_button.height};

        bool hoveringAnyButton = false;
        if(CheckCollisionPointRec(mouse, buttonRec)) {
            hoveringAnyButton = true;

            if(buttonPos.y > hoverY)
                buttonPos.y -= 0.5;
        }
        else if(buttonPos.y < baseY) {
            buttonPos.y += 0.5;
        }

        if(CheckCollisionPointRec(mouse, QuitRec)) {
            hoveringAnyButton = true;

            if(Quit_buttonPos.y > Quit_hoverY)
                Quit_buttonPos.y -= 0.5;
        }
        else if(Quit_buttonPos.y < Quit_baseY) {
            Quit_buttonPos.y += 0.5;
        }

        if(CheckCollisionPointRec(mouse, QuitRec)) {
            hoveringAnyButton = true;
        }

        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);

        if(CheckCollisionPointRec(mouse, QuitRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            UnloadTexture(Background);
            UnloadTexture(Quit_button);
            UnloadTexture(dialog_box);
            UnloadTexture(button);
            return false;
        }
        if(CheckCollisionPointRec(mouse, buttonRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            UnloadTexture(Background);
            UnloadTexture(Quit_button);
            UnloadTexture(dialog_box);
            UnloadTexture(button);
            return true;
        }

        BeginDrawing();
        ClearBackground(DARKGRAY);
        DrawTexture(Background, 0, 0, WHITE);

        DrawTexture(Quit_button, Quit_buttonPos.x, Quit_buttonPos.y, WHITE);
        DrawTexture(button, buttonPos.x, buttonPos.y, WHITE);
        DrawTexturePro(dialog_box, source, dest, origin, 0.0f, WHITE);
        DrawText(text1, 390, 80, 40, BLACK);
        DrawText(text2, 390, 130, 40, BLACK);
  
        EndDrawing();
    }
    UnloadTexture(Background);
    UnloadTexture(Quit_button);
    UnloadTexture(dialog_box);
    UnloadTexture(button);
    UnloadSound(lose);
    return 0;
}

void UpdateHealth(Stack *health, LinkedList *snake, FoodType type, bool *gameOver, char *text1, char *text2, SnakeStack* movements, int* dirCol, int* dirRow, GameState *gameState, bool *canRevive, bool *counter){
    if (type == FOOD_EGG){
            
        StackNode *temp = health->top;
        int healthLevel = 0;
        while (temp){
            healthLevel++;
            temp = temp->next;
        }
        switch (healthLevel){
            case 4:
                break;
            case 3: push(health, 102, 563);
                break;
            case 2: push(health, 74, 563);
                break;
            case 1: push(health, 46, 563);
                break;
            default:
                break;
        }       
    }
    else if (type == FOOD_BOMB){
        pop(health);
        if (health->top == NULL){

            if(*canRevive){
                strcpy(text1, "Just one more");
                strcpy(text2, "try for me?");
                bool IsRevive = ReviveScreen(text1, text2);

                if(IsRevive){
                    revive(&snake, movements, dirCol, dirRow);
                    push(health, 18, 563);
                    *counter = false;
                    *gameState = PAUSED;
                }else{
                    strcpy(text1, "I thought it was");
                    strcpy(text2, "a spicy grape!");
                    *gameOver=true;
                }
            
            }else{
                strcpy(text1, "I thought it was");
                strcpy(text2, "a spicy grape!");
                *gameOver=true;
            }

        }                     
    }
}

void UpdateFood(ActiveFood *active, LinkedList *snake, Stack *health, Queue* AbilityQueue, bool *grow, bool *gameOver, char *text1, char *text2, SnakeStack* movements, int* dirCol, int* dirRow, GameState *gameState, scoreNode *thisRound, bool *canRevive, bool *scoreDouble, bool *counter)
{
    // --- Apple eaten ---
    if (IsEating(snake, active->apple))
    {
        free(active->apple);
        
        *grow = true;
        if(*scoreDouble){
            thisRound->score += 200;
        }
        else{
            thisRound->score += 100;
        }

        if (active->special != NULL)
        {
           free(active->special);
           active->special = NULL;
        }

        // Spawn next apple
        active->apple = SpawnFood(snake, active, FOOD_APPLE);

        free(active->special);
        active->special = NULL;
        free(active->special1);
        active->special1 = NULL;
        free(active->special2);
        active->special2 = NULL;
        free(active->ability);
        active->ability = NULL;
        TrySpawnSpecial(active, snake);
        
    }

    // --- Special food eaten ---
    if (IsEating(snake, active->special))
    {
        FoodType type = active->special->type;
        UpdateHealth(health, snake, type, gameOver, text1, text2, movements, dirCol, dirRow, gameState, canRevive, counter);
        free(active->special);
        active->special = NULL;

    }
    if (IsEating(snake, active->special1))
    {    
        FoodType type = active->special1->type;
        UpdateHealth(health, snake, type, gameOver, text1, text2, movements, dirCol, dirRow, gameState, canRevive, counter);
        free(active->special1);
        active->special1 = NULL;

    }
    if (IsEating(snake, active->special2))
    {
        
        FoodType type = active->special2->type;
        UpdateHealth(health, snake, type, gameOver, text1, text2, movements, dirCol, dirRow, gameState, canRevive, counter);
        free(active->special2);
        active->special2 = NULL;

    }
    if (IsEating(snake, active->ability))
    {
        
        FoodType type = active->ability->type;
        QueueNode *temp = AbilityQueue->front;
        int QueuePlacement = 3;
        while (temp)
        {
            QueuePlacement--;
            temp = temp->next;
        }
        if(QueuePlacement >= 0){

            QueueNode *temp = AbilityQueue->front;
            int i = 0;
            while (temp)
            {
                i++;
                temp = temp->next;
            }
            if(!(i >5)){
                enqueue(AbilityQueue, 0, QueuePlacement,type); 
            } 

        }   
        free(active->ability);
        active->ability = NULL;

    }
}

void DrawFood(ActiveFood *active, Texture2D appleTexture, Texture2D eggTexture, Texture2D bombTexture, Texture2D ability_2x, Texture2D ability_slow, Texture2D ability_revive)
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
    if (active->special1)
    {
        int x = GRID_START_X + active->special1->col * CELL_SIZE;
        int y = GRID_START_Y + active->special1->row * CELL_SIZE;

        if (active->special1->type == FOOD_EGG)
            DrawTexture(eggTexture, x, y, WHITE);
        else if (active->special1->type == FOOD_BOMB)
            DrawTexture(bombTexture, x, y, WHITE);
    }
    if (active->special2)
    {
        int x = GRID_START_X + active->special2->col * CELL_SIZE;
        int y = GRID_START_Y + active->special2->row * CELL_SIZE;

        if (active->special2->type == FOOD_EGG)
            DrawTexture(eggTexture, x, y, WHITE);
        else if (active->special2->type == FOOD_BOMB)
            DrawTexture(bombTexture, x, y, WHITE);
    }
    if (active->ability)
    {   
        int x = GRID_START_X + active->ability->col * CELL_SIZE;
        int y = GRID_START_Y + active->ability->row * CELL_SIZE;

        if (active->ability->type == ABILITY_2x)
            DrawTexture(ability_2x, x, y, WHITE);
        else if (active->ability->type == ABILITY_SLOW)
            DrawTexture(ability_slow, x, y, WHITE);
        else{
            DrawTexture(ability_revive, x, y, WHITE);
        }
    }
}
Stack * initHealth(Texture2D heart){
    Stack * health = initialize();
    push(health, 18, 563);
    push(health, 46, 563);
    push(health, 74, 563);
    push(health, 102, 563);
    return health;
    
}
void DrawHealth(Stack * stack,Texture2D heart){
    StackNode *temp = stack->top;
    while (temp)
    {
        DrawTexture(heart, temp->x, temp->y, WHITE);
        temp = temp->next;
    }

}
void DrawAbilityQueue(Queue *AbilityQueue,Texture2D ability_2x, Texture2D ability_slow, Texture2D ability_revive){
    QueueNode *temp = AbilityQueue->front;
    int x;
    int y;
    while (temp)
    {
        x = 10 + temp->col * 68;
        y = 200 + temp->row * 68;
        switch (temp->type)
        {
        case ABILITY_2x:
            DrawTexture(ability_2x, x, y, WHITE);
            break;
        case ABILITY_SLOW:
            DrawTexture(ability_slow, x, y, WHITE);
            break;
        case ABILITY_REVIVE:
            DrawTexture(ability_revive, x, y, WHITE);
            break;
        
        default:
            break;
        }
        
        temp = temp->next;
    }
}

void useAbility(Queue *AbilityQueue, LinkedList** snake, SnakeStack* movements, int* dirCol, int* dirRow, float *reviveTimer, float *scoreDoubleTimer, bool *counter, GameState *gameState, bool *canRevive, bool *scoreDouble, float *MoveDelay, float *slowTimer) {
    if (!AbilityQueue->front) return;

    switch (AbilityQueue->front->type) {
        case ABILITY_REVIVE:
            *counter = true;
            *canRevive = true;
            *reviveTimer = 5.0f;
            break;

        case ABILITY_2x:
            *counter = true;
            *scoreDouble = true;
            *scoreDoubleTimer = 10.0f;
            break;

        case ABILITY_SLOW:
            *counter = true;
            *MoveDelay = 0.30f;
            *slowTimer = 10.0f;
            break;
        default:
            break;
    }
    dequeue(AbilityQueue);
    QueueNode* temp = AbilityQueue->front;
    while (temp)
    {
        temp->row++;
        temp = temp->next;
    }   
}

void HandleInput(int *dirX, int *dirY, Queue *AbilityQueue, LinkedList** snake, SnakeStack* movements, float *reviveTimer, float *scoreDoubleTimer, bool *counter, GameState *gameState, int dirColSave, int dirRowSave, bool *canRevive, bool *scoreDouble, float *MoveDelay, float *slowTimer)
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
    if (IsKeyPressed(KEY_E)) {
        if(!*counter){
            useAbility(AbilityQueue, snake, movements, dirX, dirY, reviveTimer, scoreDoubleTimer, counter, gameState, canRevive, scoreDouble, MoveDelay, slowTimer);
            *counter = true;

        }
    }
    if (IsKeyPressed(KEY_P) || IsKeyPressed(KEY_ESCAPE)) {
        if (*gameState != PAUSED){

            *gameState = PAUSED;
            *dirX = 0;
            *dirY = 0;
        }

        else if (*gameState == PAUSED){

            *gameState = PLAYING;
            *dirX = dirColSave;
            *dirY = dirRowSave;
        }
    }

}
void UpdateCountdown(float dt, float *reviveTimer, float *scoreDoubleTimer, GameState *gameState, bool *canRevive, bool *scoreDouble, float *MoveDelay, float *slowTimer, bool *counter){

    if (*canRevive){
        *reviveTimer -= dt;

        if (*reviveTimer <= 0.0f)
        {
            *counter = false;
            *canRevive = false;
        }
    }
    if(*scoreDouble){
        *scoreDoubleTimer -= dt;

        if (*scoreDoubleTimer <= 0.0f)
        {
            *scoreDouble = false;
            *counter = false;
        }
    }
    if(*MoveDelay > 0.29f){
        *slowTimer -= dt;

        if (*slowTimer <= 0.0f)
        {
            *MoveDelay = 0.25f;
            *counter = false;
        }
    }
}

void MoveSnake(LinkedList* snake, SnakeStack* movements, int *dirCol,int *dirRow, bool *gameOver, bool *grow, char *text1, char *text2, GameState *gameState, bool *canRevive, bool *counter)
{
    if (!snake || !snake->head) return;

    int newCol = snake->head->col + *dirCol;
    int newRow = snake->head->row + *dirRow;

    if(newRow < 0 || newRow >= GRID_ROWS || newCol < 0 || newCol >= GRID_COLS){
        
        if(*canRevive){
            strcpy(text1, "Just one more");
            strcpy(text2, "try for me?");
            bool IsRevive = ReviveScreen(text1, text2);
            if(IsRevive){
                revive(&snake, movements, dirCol, dirRow);
                *counter = false;
                *gameState = PAUSED;
            }else{
                strcpy(text1, "That wall came");
                strcpy(text2, "out of nowhere!");
                *gameOver=true;
            }
            
        }else{
            strcpy(text1, "That wall came");
            strcpy(text2, "out of nowhere!");
            *gameOver=true;
        }
    }  

    if(CheckSelfCollision(snake, newRow, newCol)){
        if(*canRevive){
            strcpy(text1, "Just one more");
            strcpy(text2, "try for me?");
            bool IsRevive = ReviveScreen(text1, text2);
            if(IsRevive){
                revive(&snake, movements, dirCol, dirRow);
                *counter = false;
                *gameState = PAUSED;
            }else{
                strcpy(text1, "I think I tripped");
                strcpy(text2, "on my own tail...");
                *gameOver=true;
            }
            
        }else{
            strcpy(text1, "I think I tripped");
            strcpy(text2, "on my own tail...");
            *gameOver=true;
        }
    }     

    Node* temp = snake->head;
    while (temp) {
        temp->prevX = GRID_START_X + temp->col * CELL_SIZE;
        temp->prevY = GRID_START_Y + temp->row * CELL_SIZE;
        temp = temp->next;
    }

    float oldHeadX = snake->head->prevX;
    float oldHeadY = snake->head->prevY;

    //Insert new head
    insertAtHead(snake, newCol, newRow);

    snake->head->prevX = oldHeadX;
    snake->head->prevY = oldHeadY;

    if(!*grow)
        RemoveTail(snake);
    else
        *grow=false;
    
}

void DrawScores(ScoreList* list)
{
    if (!list || !list->head)
    {
        DrawText("No Scores Yet", 250, 200, 40, WHITE);
        return;
    }

    scoreNode* temp = list->head;

    int startX = 250;
    int startY = 150;
    int lineHeight = 50;

    int rank = 1;

    while (temp)
    {
        char text[100];
        sprintf(text, "%d. %d", rank, temp->score);
        DrawText(text, startX, startY, 50, WHITE);

        startY += lineHeight;
        temp = temp->next;
        rank++;
    }
}

void DrawHighestScores(int scoreArray[], int size)
{
    if (size <= 0)
    {
        DrawText("No Scores Yet", 250, 200, 40, WHITE);
        return;
    }

    int startX = 250;
    int startY = 150;
    int lineHeight = 50;

    int rank = 1;
    int i;

    for(i = 0; i < size; i++){
        char text[100];
        sprintf(text, "%d. %d", rank, scoreArray[i]);
        DrawText(text, startX, startY, 50, WHITE);
        startY += lineHeight;
        rank++;
    }
}

void convertToArray(ScoreList* ScoreList, int scoreArray[]){
    int i = 0;
    scoreNode* temp = ScoreList->head;
    while (temp != NULL) {
        scoreArray[i] = temp->score;
        temp = temp->next;
        i++;
    }
}

typedef enum GameScreen {MENU, MAP, GAME, SCORES, HISTORY, HIGHEST_SCORE, EXIT_GAME} GameScreen;

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
            return MAP;
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


GameScreen ReplayScreen(char *text1, char *text2, ScoreList* ScoreList){
    Texture2D Background = LoadTexture("Graphics/gameover bg.png");
    Font fontRegular = LoadFontEx("resources/FFFFORWA.ttf", 128, 0, 0);

    Sound lose = LoadSound("resources/lose.mp3");

    Music bgmusic = LoadMusicStream("resources/Camp Approach.mp3");
    SetMusicVolume(bgmusic, 0.5f);  
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

    Texture2D Quit_button = LoadTexture("Graphics/quit.png");
    Vector2 Quit_buttonPos = {370,350};
    float Quit_baseY = Quit_buttonPos.y;
    float Quit_hoverY = Quit_baseY - 5;

    bool soundPlayed = false;
    char text[100];
    
    while (!WindowShouldClose()){

        if (!soundPlayed)
        {
            PlaySound(lose);
            soundPlayed = true;
        }   

        UpdateMusicStream(bgmusic);

        Vector2 mouse = GetMousePosition();
        Rectangle buttonRec = {buttonPos.x, buttonPos.y, button.width, button.height};
        Rectangle QuitRec  = {Quit_buttonPos.x, Quit_buttonPos.y, Quit_button.width, Quit_button.height};

        bool hoveringAnyButton = false;
        if(CheckCollisionPointRec(mouse, buttonRec)) {
            hoveringAnyButton = true;

            if(buttonPos.y > hoverY)
                buttonPos.y -= 0.5;
        }
        else if(buttonPos.y < baseY) {
            buttonPos.y += 0.5;
        }

        if(CheckCollisionPointRec(mouse, QuitRec)) {
            hoveringAnyButton = true;

            if(Quit_buttonPos.y > Quit_hoverY)
                Quit_buttonPos.y -= 0.5;
        }
        else if(Quit_buttonPos.y < Quit_baseY) {
            Quit_buttonPos.y += 0.5;
        }

        if(CheckCollisionPointRec(mouse, QuitRec)) {
            hoveringAnyButton = true;
        }

        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);

        if(CheckCollisionPointRec(mouse, QuitRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            UnloadTexture(Background);
            UnloadTexture(Quit_button);
            UnloadTexture(dialog_box);
            UnloadTexture(button);
            return MENU;
        }
        if(CheckCollisionPointRec(mouse, buttonRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            UnloadTexture(Background);
            UnloadTexture(Quit_button);
            UnloadTexture(dialog_box);
            UnloadTexture(button);
            return MAP;
        }

        BeginDrawing();
        ClearBackground(DARKGRAY);
        DrawTexture(Background, 0, 0, WHITE);

        DrawTexture(Quit_button, Quit_buttonPos.x, Quit_buttonPos.y, WHITE);
        DrawTexture(button, buttonPos.x, buttonPos.y, WHITE);
        DrawTexturePro(dialog_box, source, dest, origin, 0.0f, WHITE);
        DrawText(text1, 390, 80, 40, BLACK);
        DrawText(text2, 390, 130, 40, BLACK);
        sprintf(text, "%d", ScoreList->head->score);
        DrawTextEx(fontRegular, "SCORE : ", (Vector2){ 400, 480 }, 55, 2, button_orange);
        DrawTextEx(fontRegular, text, (Vector2){ 620, 480 }, 55, 2, WHITE);        

        EndDrawing();
    }
    UnloadTexture(Background);
    UnloadTexture(Quit_button);
    UnloadTexture(dialog_box);
    UnloadTexture(button);
    UnloadSound(lose);
    return EXIT_GAME;

}

GameScreen MapScreen(Texture2D play_background,Texture2D Back_button, ScoreList* ScoreList, GameState *gameState){

    Texture2D SnakePart = LoadTexture("Graphics/SnakePart.png");
    Texture2D SnakeHead = LoadTexture("Graphics/SnakeHead.png");
    Texture2D SnakeTail = LoadTexture("Graphics/SnakeTail.png");

    Texture2D apple = LoadTexture("Graphics/Apple.png");
    Texture2D egg   = LoadTexture("Graphics/Egg.png");
    Texture2D bomb  = LoadTexture("Graphics/Bomb.png");
    Texture2D ability_2x  = LoadTexture("Graphics/ability 2x.png");
    Texture2D ability_slow  = LoadTexture("Graphics/ability slow.png");
    Texture2D ability_revive  = LoadTexture("Graphics/ability revive.png");
    Texture2D ability_2x_B  = LoadTexture("Graphics/2x B.png");
    Texture2D ability_slow_B  = LoadTexture("Graphics/slow B.png");
    Texture2D ability_revive_B  = LoadTexture("Graphics/respawn B.png");


    Texture2D healthBar  = LoadTexture("Graphics/health bar.png");
    Texture2D heart  = LoadTexture("Graphics/heart.png");

    Font fontRegular = LoadFontEx("resources/FFFFORWA.ttf", 128, 0, 0);
    Font robotoRegular = LoadFontEx("resources/Roboto-SemiBoldItalic.ttf", 128, 0, 0);
    SetTextureFilter(robotoRegular.texture, TEXTURE_FILTER_BILINEAR);

    Music gameplayMusic = LoadMusicStream("resources/MilkyWay.mp3");
    SetMusicVolume(gameplayMusic, 0.5f);  
    PlayMusicStream(gameplayMusic);

    Vector2 Back_buttonPos = {30,20};

    char text1[100], text2[100];

    int dirCol=0;
    int dirRow=1;

    bool showTutorial = false;
    bool grow = false;
    bool gameOver = false;
    bool scoreDouble = false;
    bool canRevive = false;
    float MoveDelay = 0.25f;

    int score = 0;
    insertScore(ScoreList,score);

    if(*gameState == TUTORIAL){
        showTutorial = true;
    }
    
    *gameState = PLAYING;
    
    float reviveTimer = 0.0f;
    float scoreDoubleTimer = 0.0f;
    float slowTimer = 0.0f;

    bool counter = false;

    int displayTime = 0; 

    LinkedList* snake = InitSnake();
    Stack * health = initHealth(heart);
    Queue* AbilityQueue = initQueue();
    SnakeStack* movements =  initSavedSnake();

    ActiveFood activeFood = {0};
    activeFood.apple = SpawnFood(snake, &activeFood , FOOD_APPLE);
    activeFood.special = NULL;

    int dirColSave = dirCol;
    int dirRowSave = dirRow;
    char text[100];
    char abilityText[100];
    char DisplayTimeText[100];

    while (!WindowShouldClose()){

        if(showTutorial){
            *gameState = PAUSED;
        }
        UpdateMusicStream(gameplayMusic);

        float dt = GetFrameTime();
        bool showTimer = false;

        HandleInput(&dirCol, &dirRow, AbilityQueue, &snake, movements, &reviveTimer, &scoreDoubleTimer, &counter, gameState, dirColSave, dirRowSave, &canRevive, &scoreDouble, &MoveDelay, &slowTimer);
        UpdateCountdown(dt, &reviveTimer, &scoreDoubleTimer, gameState, &canRevive, &scoreDouble, &MoveDelay, &slowTimer, &counter);

        if(dirCol != 0 || dirRow != 0){
            dirColSave = dirCol;
            dirRowSave = dirRow;
        }
        
        if(*gameState != PAUSED){
            moveTimer += dt;
            while(moveTimer >= MoveDelay && !gameOver ){
                
                MoveSnake(snake, movements, &dirCol, &dirRow,&gameOver, &grow, text1, text2, gameState, &canRevive, &counter);
                moveTimer -= MoveDelay;

                if (!gameOver && (dirCol != 0 || dirRow != 0)) {
                    saveMovements(snake, movements, dirCol, dirRow);
                }
            }
            float alpha = moveTimer / MoveDelay;

            UpdateSmoothMovement(snake, alpha);
            UpdateFood(&activeFood, snake, health, AbilityQueue, &grow, &gameOver, text1, text2,movements, &dirCol, &dirRow, gameState, ScoreList->head, &canRevive, &scoreDouble, &counter);
        }

        if (canRevive) {
            displayTime = (int)reviveTimer;
            showTimer = true;
            strcpy(abilityText, "Can Revive :");

        } else if (scoreDouble) {
            displayTime = (int)scoreDoubleTimer;
            showTimer = true;
            strcpy(abilityText, "Score Bonus :");

        } else if (MoveDelay > 0.29f) {
            displayTime = (int)slowTimer;
            showTimer = true;
            strcpy(abilityText, "Move Slow :");
        }
        sprintf(DisplayTimeText, "%d", displayTime);

        if(gameOver){
            WaitTime(1.3f);
            free(snake);
            UnloadTexture(SnakePart);
            UnloadTexture(SnakeHead);
            UnloadTexture(SnakeTail);
            UnloadTexture(apple);
            UnloadTexture(egg);
            UnloadTexture(bomb);
            UnloadTexture(ability_2x);
            UnloadTexture(ability_slow);
            UnloadTexture(ability_revive);
            UnloadTexture(ability_2x_B);
            UnloadTexture(ability_slow_B);
            UnloadTexture(ability_revive_B);
            UnloadTexture(healthBar);
            UnloadTexture(heart);
            StopMusicStream(gameplayMusic);
            UnloadMusicStream(gameplayMusic);
            return ReplayScreen(text1,text2, ScoreList);
        }

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
            UnloadTexture(ability_2x);
            UnloadTexture(ability_slow);
            UnloadTexture(ability_revive);
            UnloadTexture(ability_2x_B);
            UnloadTexture(ability_slow_B);
            UnloadTexture(ability_revive_B);
            UnloadTexture(healthBar);
            UnloadTexture(heart);
            StopMusicStream(gameplayMusic);
            UnloadMusicStream(gameplayMusic);

            return MAP;
        }
        
        BeginDrawing();
        ClearBackground(BLACK);

        DrawTexture(play_background, 0, 0, WHITE);
        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);

        DrawFood(&activeFood, apple, egg, bomb, ability_2x, ability_slow, ability_revive);
        DrawSnake(snake,SnakeHead,SnakeTail,SnakePart,dirCol,dirRow,dirColSave,dirRowSave);
        DrawTexture(healthBar, 10, 555, WHITE);
        DrawHealth(health,heart);
        DrawAbilityQueue(AbilityQueue,ability_2x_B, ability_slow_B, ability_revive_B);
        sprintf(text, "%d", ScoreList->head->score);
        DrawRectangle(540, 545, 300, 100, 
                      (Color){0, 0, 0, 120});  
        DrawTextEx(fontRegular, "SCORE : ", (Vector2){ 550, 560 }, 35, 2, button_orange);
        DrawTextEx(fontRegular, text, (Vector2){ 700, 560 }, 35, 2, WHITE);
        
        
        if(showTimer){
            DrawTextEx(fontRegular, abilityText, (Vector2){ 200, 560 }, 35, 2, DARKBLUE);
            DrawTextEx(fontRegular, DisplayTimeText, (Vector2){ 430, 560 }, 35, 2, WHITE);

        }

        if (*gameState == PAUSED && !showTutorial) {
        DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), 
                      (Color){0, 0, 0, 120});         
        DrawText("PAUSED",    285, 220, 60, WHITE);
        DrawText("Press Esc to resume", 280, 300, 25, LIGHTGRAY);
        DrawText("Safe Start: Choose a direction", 230, 350, 25, GOLD);
        }
        if (*gameState == PAUSED && showTutorial) {
        DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), 
                      (Color){0, 0, 0, 200});         
        DrawText("TUTORIAL",    250, 50, 60, WHITE);
   
        DrawTextEx(robotoRegular, "Press Esc to resume", (Vector2){ 250, 170 }, 35, 2, LIGHTGRAY);
        DrawTextEx(robotoRegular, "Press [E] -> ACTIVATE ABILITY", (Vector2){ 230, 350 }, 25, 2, GOLD);
        DrawTextEx(robotoRegular, "BOMB ->  - HEALTH (Watch Out!)", (Vector2){ 230, 250 }, 25, 2, GOLD);
        DrawTextEx(robotoRegular, "EGG ->  + HEALTH (Stay Strong!)", (Vector2){ 230, 300 }, 25, 2, GOLD);
        DrawTextEx(robotoRegular, "DOUBLE SCORE", (Vector2){ 330, 410 }, 25, 2, GOLD);
        DrawTextEx(robotoRegular, "SLOW SLITHER", (Vector2){ 330, 470 }, 25, 2, GOLD);
        DrawTextEx(robotoRegular, "REVIVE SOUL", (Vector2){ 330, 530 }, 25, 2, GOLD);

        DrawTexture(bomb, 170, 240, WHITE);
        DrawTexture(egg, 170, 290, WHITE);
        DrawTexture(ability_2x_B, 240, 390, WHITE);
        DrawTexture(ability_slow_B, 240, 450, WHITE);
        DrawTexture(ability_revive_B, 240, 510, WHITE);
        
        }
        
        EndDrawing();
        if(*gameState == PLAYING)
            showTutorial = false;
    }
    
    free(snake);
    UnloadTexture(SnakePart);
    UnloadTexture(SnakeHead);
    UnloadTexture(SnakeTail);
    UnloadTexture(apple);
    UnloadTexture(egg);
    UnloadTexture(bomb);
    UnloadTexture(ability_2x);
    UnloadTexture(ability_slow);
    UnloadTexture(ability_revive);
    UnloadTexture(ability_2x_B);
    UnloadTexture(ability_slow_B);
    UnloadTexture(ability_revive_B);
    UnloadTexture(healthBar);
    UnloadTexture(heart);
    StopMusicStream(gameplayMusic);
    UnloadMusicStream(gameplayMusic);
    return EXIT_GAME;
}

GameScreen ScoreHistory(ScoreList* ScoreList, Texture2D Back_button, Music bgMusic){

    Texture2D Background = LoadTexture("Graphics/score background 2.png");

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
            return SCORES;
        }

        BeginDrawing();
        ClearBackground(DARKGRAY);
        DrawTexture(Background, 0, 0, WHITE);
        DrawText("Score History", 250, 50, 40, GOLD);
        DrawScores(ScoreList);
        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);

        EndDrawing();
    }
    return EXIT_GAME;
}

GameScreen HighestScore(ScoreList* ScoreList, Texture2D Back_button, Music bgMusic){

    Texture2D Background = LoadTexture("Graphics/score background 3.png");

    Vector2 Back_buttonPos = {30,20};

    int count = 0;
    scoreNode* temp = ScoreList->head;
    while (temp != NULL) {
        count++;
        temp = temp->next;
    }

    int* scoreArray = (int*)malloc(count * sizeof(int));

    convertToArray(ScoreList, scoreArray);

    insertionSort(scoreArray, count);

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
            return SCORES;
        }

        BeginDrawing();
        ClearBackground(DARKGRAY);
        DrawTexture(Background, 0, 0, WHITE);

        DrawText("Highest Score", 250, 50, 40, GOLD);
        
        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);
        DrawHighestScores(scoreArray, count);
        EndDrawing();
    }
    return EXIT_GAME;
}

GameScreen ScoreScreen(Texture2D Back_button, Music bgMusic, Texture2D History, Texture2D Highest_score){

    Texture2D Background = LoadTexture("Graphics/score background 1.png");

    Vector2 Back_buttonPos = {30,20};

    Vector2 History_buttonPos = {350,200};
    float Score_baseY = History_buttonPos.y;
    float Score_hoverY = Score_baseY - 5;

    Vector2 Highest_buttonPos = {350,300};
    float Exit_baseY = Highest_buttonPos.y;
    float Exit_hoverY = Exit_baseY - 5;

    Rectangle ScoreRec  = {History_buttonPos.x, History_buttonPos.y, History.width, History.height};
    Rectangle ExitRec   = {Highest_buttonPos.x, Highest_buttonPos.y, Highest_score.width, Highest_score.height};

    while (!WindowShouldClose()){

        UpdateMusicStream(bgMusic);

        Vector2 mouse = GetMousePosition();
        Rectangle BackRec   = {Back_buttonPos.x, Back_buttonPos.y, Back_button.width, Back_button.height};

        bool hoveringAnyButton = false;

        if(CheckCollisionPointRec(mouse, BackRec)) {
            hoveringAnyButton = true;
        }

        // Score button
        if(CheckCollisionPointRec(mouse, ScoreRec)) {
            hoveringAnyButton = true;

            if(History_buttonPos.y > Score_hoverY)
                History_buttonPos.y -= 0.5;
        }
        else if(History_buttonPos.y < Score_baseY) {
            History_buttonPos.y += 0.5;
        }

        // Exit button
        if(CheckCollisionPointRec(mouse, ExitRec)) {
            hoveringAnyButton = true;

            if(Highest_buttonPos.y > Exit_hoverY)
                Highest_buttonPos.y -= 0.5;
        }
        else if(Highest_buttonPos.y < Exit_baseY) {
            Highest_buttonPos.y += 0.5;
        }


        // Set cursor ONCE
        if(hoveringAnyButton)
            SetMouseCursor(MOUSE_CURSOR_POINTING_HAND);
        else
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);

        if(CheckCollisionPointRec(mouse, ScoreRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return HISTORY;
        }
        if(CheckCollisionPointRec(mouse, ExitRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return HIGHEST_SCORE; 
        }

        if(CheckCollisionPointRec(mouse, BackRec)) {
            hoveringAnyButton = true;
        }

        if(CheckCollisionPointRec(mouse, BackRec) && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)){
            SetMouseCursor(MOUSE_CURSOR_DEFAULT);
            return MENU;
        }

        BeginDrawing();
        ClearBackground(DARKGRAY);

        DrawTexture(Background, 0, 0, WHITE);
        DrawText("Score Board", 250, 50, 40, GOLD);
        DrawTexture(History, History_buttonPos.x, History_buttonPos.y, WHITE);
        DrawTexture(Highest_score, Highest_buttonPos.x, Highest_buttonPos.y, WHITE);
        DrawTexture(Back_button, Back_buttonPos.x, Back_buttonPos.y, WHITE);

        EndDrawing();
    }
    return EXIT_GAME;
}

GameScreen SelectMap(Texture2D Map1, Texture2D Map2, Texture2D Map3, Texture2D Map4, Texture2D *Selected, Texture2D Back_button, Music bgMusic){

    
    Texture2D map_background = LoadTexture("Graphics/map background.png");
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
            FadeToBlack(2.5f,"Ready...");
            StopMusicStream(bgMusic);
            *Selected = currentMap->MapName;
            return GAME;
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

    BeginDrawing();
    ClearBackground(BLACK);
    FadeToBlack(2.5f,"Loading...");
    EndDrawing();

    SetTargetFPS(60);
    SetExitKey(KEY_NULL);

    // Load textures
    Texture2D background = LoadTexture("Graphics/background 2.png");
    Texture2D logo = LoadTexture("Graphics/snake pop.png");
    Texture2D button = LoadTexture("Graphics/start button.png");
    Texture2D Score_button = LoadTexture("Graphics/score board.png");
    Texture2D Exit_button = LoadTexture("Graphics/exit button.png");
    Texture2D Back_button = LoadTexture("Graphics/Back_Button.png");
    Texture2D History_button = LoadTexture("Graphics/history.png");
    Texture2D Highest_button = LoadTexture("Graphics/highest score.png");

    Texture2D Map1 = LoadTexture("Graphics/Map 1.png");
    Texture2D Map2 = LoadTexture("Graphics/Map 2.jpeg");
    Texture2D Map3 = LoadTexture("Graphics/Map 3.jpeg");
    Texture2D Map4 = LoadTexture("Graphics/Map 4.jpeg");
    Texture2D Selected;

    InitAudioDevice();
    Music bgMusic = LoadMusicStream("resources/Fastfall.mp3");
    SetMusicVolume(bgMusic, 0.5f);  
    
    ScoreList* ScoreList = initScoreList();

    // Current screen
    GameScreen currentScreen = MENU;
    GameState gameState= TUTORIAL;

    while (!WindowShouldClose()) {
        PlayMusicStream(bgMusic);
        UpdateMusicStream(bgMusic);

        BeginDrawing();
        ClearBackground(BLACK);

        switch(currentScreen) {

            case MENU: currentScreen = MenuScreen(background, logo, button, Score_button, Exit_button,bgMusic);
                 break; 

            case MAP: currentScreen = SelectMap(Map1, Map2, Map3, Map4, &Selected,  Back_button,bgMusic);
                break;

            case GAME: currentScreen = MapScreen(Selected,Back_button, ScoreList, &gameState);
                break;

            case SCORES: currentScreen = ScoreScreen(Back_button,bgMusic, History_button, Highest_button);
                 break;

            case HISTORY: currentScreen = ScoreHistory(ScoreList, Back_button, bgMusic);
                 break;

            case HIGHEST_SCORE: currentScreen = HighestScore(ScoreList, Back_button, bgMusic);
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