package main

import (
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"git.sr.ht/~jackmordaunt/go-toast"
	"github.com/energye/systray"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"log"
	"strconv"

	"Go_Arknights_Gacha_App/utils"
)

// App struct
type App struct {
	ctx      context.Context
	phone    string
	password string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.appSystray()
}

//func (a *App) getWindowsMenu() *menu.Menu {
//	m := menu.NewMenu()
//	ctlMenu := m.AddSubmenu("操作")
//	ctlMenu.AddText("刷新", keys.Key("f5"), func(data *menu.CallbackData) {
//		runtime.WindowReload(a.ctx)
//	})
//	return m
//}

func (a *App) ReloadFrontend() {
	runtime.WindowReload(a.ctx)
}

func (a *App) WindowMinSize() {
	runtime.WindowMinimise(a.ctx)
}

func (a *App) WindowToggleMaxSize() bool {
	isMax := runtime.WindowIsMaximised(a.ctx)
	if isMax {
		runtime.WindowUnmaximise(a.ctx)
	} else {
		runtime.WindowMaximise(a.ctx)
	}
	return isMax
}

func (a *App) WindowClose() {
	runtime.Quit(a.ctx)
}

// 将原数据按卡池分组
func groupByPoolName(data []utils.CharInfo) map[string][]utils.CharInfo {
	groupedData := make(map[string][]utils.CharInfo)
	for _, item := range data {
		key := item.PoolName
		groupedData[key] = append(groupedData[key], item)
	}
	return groupedData
}

// GetPhoneAndPassword 获取账户登录信息
func (a *App) GetPhoneAndPassword(phone, password string) {
	// 保存登录信息
	a.phone = phone
	a.password = password
	return
}

// 与原项目一致的数据拉取流程
func (a *App) getGachaData() ([]utils.CharInfo, error) {
	if a.phone == "" || a.password == "" {
		return nil, fmt.Errorf("用户未登录")
	}

	token, err := utils.TokenByPhoneAndPasswordPost(a.phone, a.password)
	if err != nil {
		return nil, err
	}

	grantToken, _, _ := utils.GrantPost(token)
	uid, bingingErr := utils.BindingListGet(grantToken, "arknights")
	if bingingErr != nil {
		return nil, bingingErr
	}
	u8Token, u8Err := utils.U8TokenByUidPost(uid, grantToken)
	if u8Err != nil {
		return nil, u8Err
	}
	akCookie := utils.LoginPost(u8Token)
	category := utils.GachaCategoryGet(akCookie, uid, u8Token, token)

	allHistoryData := make([]utils.CharInfo, 0)
	for _, categoryID := range category {
		var gachaTs string
		var pos string
		for {
			historyData := utils.GachaHistoryGet(akCookie, uid, categoryID.ID, token, gachaTs, pos, u8Token)
			if historyData.HasMore {
				allHistoryData = append(allHistoryData, historyData.List...)
				gachaTs = historyData.List[len(historyData.List)-1].GachaTs
				pos = strconv.Itoa(historyData.List[len(historyData.List)-1].Pos)
			} else {
				allHistoryData = append(allHistoryData, historyData.List...)
				break
			}
		}
	}
	return allHistoryData, nil
}

// RefreshGachaHistory 导出给前端调用的方法：返回按池子分组后的 JSON 字符串
func (a *App) RefreshGachaHistory() (string, error) {
	allHistoryData, err := a.getGachaData()
	if err != nil {
		log.Println("Failed to retrieve gacha data:", err)
		return "", err
	}
	grouped := groupByPoolName(allHistoryData)
	jsonData, err := json.MarshalIndent(grouped, "", "  ")
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}

//go:embed frontend/src/assets/icons/home.ico
var homeIcon []byte

//go:embed frontend/src/assets/icons/show.ico
var showIcon []byte

//go:embed frontend/src/assets/icons/hide.ico
var hideIcon []byte

//go:embed frontend/src/assets/icons/reload.ico
var reloadIcon []byte

//go:embed frontend/src/assets/icons/quit.ico
var quitIcon []byte

// AppSystray App系统托盘
func (a *App) appSystray() {
	systray.Run(a.onReady, a.onExit)
}

func (a *App) onReady() {
	systray.SetIcon(homeIcon)
	systray.SetTitle("Arknights Gacha History")
	systray.SetTooltip("Arknights Gacha History")

	systray.SetOnClick(func(menu systray.IMenu) {
		runtime.Show(a.ctx)
	})
	systray.SetOnRClick(func(menu systray.IMenu) {
		fmt.Println("右键点击")
		menu.ShowMenu()
	})

	showMenu := systray.AddMenuItem("显示", "Show the gacha app")
	showMenu.SetIcon(showIcon)
	showMenu.Click(func() {
		go runtime.Show(a.ctx)
	})

	hideMenu := systray.AddMenuItem("隐藏", "Hide the gacha app")
	hideMenu.SetIcon(hideIcon)
	hideMenu.Click(func() {
		go runtime.Hide(a.ctx)
	})

	reloadMenu := systray.AddMenuItem("重置", "Reload the gacha app")
	reloadMenu.SetIcon(reloadIcon)
	reloadMenu.Click(func() {
		go a.ReloadFrontend()
		go a.notify("Arknights Gacha History消息", "已重置App内容")
	})

	quitMenu := systray.AddMenuItem("Quit", "Quit the gacha app")
	quitMenu.SetIcon(quitIcon)
	quitMenu.Click(func() {
		a.onExit()
	})
}

func (a *App) onExit() {
	systray.Quit()
	runtime.Quit(a.ctx)
}

// 系统桌面消息提示
func (a *App) notify(str string, msg string) {
	notification := toast.Notification{
		AppID: "Arknights_Gacha_History",
		Title: str,
		Body:  msg,
		Icon:  "D:\\GoLand\\Gacha_App\\Go_Arknights_Gacha_App\\frontend\\src\\assets\\icons\\home.ico",
		Actions: []toast.Action{
			{
				Type:      "protocol",
				Content:   "查看详情",
				Arguments: "https://rolingg.top",
			},
		},
		Audio: toast.Default,
	}
	err := notification.Push()
	if err != nil {
		log.Fatalln(err)
	}
}
