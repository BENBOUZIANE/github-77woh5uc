package com.cosmetovigilance.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {
            "/",
            "/login",
            "/dashboard",
            "/cosmetovigilance",
            "/declarations",
            "/declarations/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
